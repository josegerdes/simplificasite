import { randomUUID } from "crypto";

import { Db, ObjectId } from "mongodb";
import { Payment } from "mercadopago";

import { EnrollmentDoc, PaymentStatus } from "@/server/db/schema";
import { ApiError } from "@/server/auth/guards";
import { onlyDigits } from "@/server/lib/normalize";
import * as coursesRepo from "@/server/modules/courses/repository";
import * as enrollmentsRepo from "@/server/modules/enrollments/repository";
import * as sellersService from "@/server/modules/sellers/service";
import * as siteConfigRepo from "@/server/modules/site-config/repository";
import { getMercadoPagoClient } from "@/server/modules/enrollments/mercadopago-client";
import { sendPurchaseConversion } from "@/server/modules/enrollments/facebook-capi";
import { PayCheckoutInput, StartCheckoutInput } from "@/server/modules/enrollments/types";

/** Mercado Pago retorna vários status possíveis pro mesmo pagamento — mapeia pro
 *  vocabulário interno, mais simples (o que importa pro vendedor é: aprovado ou não). */
function mapMpStatus(mpStatus: string): PaymentStatus {
  switch (mpStatus) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "cancelled":
      return "cancelled";
    case "refunded":
    case "charged_back":
      return "refunded";
    default:
      return "pending";
  }
}

/**
 * Confirmação de identidade de dois fatores (CPF + telefone) pra agilizar a matrícula de
 * quem já comprou antes — só devolve dado pessoal salvo se os dois baterem juntos (LGPD:
 * CPF sozinho não é segredo suficiente pra liberar nome/endereço de alguém pra qualquer um
 * que descubra o número). Sem match, o formulário completo é preenchido do zero mesmo.
 */
export async function lookupStudent(db: Db, cpfRaw: string, phoneRaw: string) {
  const cpf = onlyDigits(cpfRaw);
  const phone = onlyDigits(phoneRaw);
  if (cpf.length < 11 || phone.length < 8) {
    return { found: false as const };
  }

  const enrollment = await enrollmentsRepo.findMostRecentByCpfAndPhone(db, cpf, phone);
  if (!enrollment) return { found: false as const };

  return {
    found: true as const,
    profile: {
      studentName: enrollment.studentName,
      studentEmail: enrollment.studentEmail,
      studentRg: enrollment.studentRg,
      studentBornDate: enrollment.studentBornDate,
      studentCivilState: enrollment.studentCivilState,
      address: enrollment.address,
    },
  };
}

export async function startCheckout(db: Db, input: StartCheckoutInput) {
  const course = await coursesRepo.findCourseBySlug(db, input.courseSlug);
  if (!course || course.status === "DRAFT" || course.status === "CLOSED") {
    throw new ApiError(404, "Curso não encontrado");
  }
  if (course.seatsLimit !== null && course.seatsSold >= course.seatsLimit) {
    throw new ApiError(409, "As vagas deste curso se esgotaram");
  }

  const now = new Date();
  const enrollment: EnrollmentDoc = {
    _id: new ObjectId(),
    courseId: course._id,
    studentName: input.studentName,
    studentEmail: input.studentEmail.toLowerCase(),
    studentPhone: onlyDigits(input.studentPhone),
    studentCpf: onlyDigits(input.studentCpf),
    studentRg: input.studentRg,
    studentBornDate: input.studentBornDate,
    studentCivilState: input.studentCivilState,
    address: input.address,
    amount: course.price,
    paymentProvider: "mercadopago",
    paymentStatus: "pending",
    mpPreferenceId: null,
    mpPaymentId: null,
    sellerId: null,
    contactStatus: "not_contacted",
    notes: [],
    utm: input.utm,
    purchaseEventId: randomUUID(),
    conversionsApiSent: false,
    createdAt: now,
    updatedAt: now,
  };
  await enrollmentsRepo.insertEnrollment(db, enrollment);

  return {
    enrollmentId: enrollment._id.toHexString(),
    amount: enrollment.amount,
    courseName: course.name,
    studentEmail: enrollment.studentEmail,
    purchaseEventId: enrollment.purchaseEventId,
  };
}

/**
 * Aplica o resultado de um pagamento (chamado tanto pelo POST .../pay quanto pelo
 * webhook) de forma idempotente — nunca soma vaga/dispara Conversions API duas vezes
 * pro mesmo pagamento aprovado, mesmo que os dois caminhos cheguem quase juntos.
 */
async function applyPaymentResult(db: Db, enrollment: EnrollmentDoc, mpPaymentId: string | null, mpStatus: string) {
  const status = mapMpStatus(mpStatus);
  const wasAlreadyApproved = enrollment.paymentStatus === "approved";

  const updated = await enrollmentsRepo.updatePaymentStatus(db, enrollment._id, {
    paymentStatus: status,
    mpPaymentId,
  });
  if (!updated) return;

  if (status === "approved" && !wasAlreadyApproved) {
    await coursesRepo.incrementSeatsSold(db, enrollment.courseId);

    const sellerId = await sellersService.assignNextSeller(db);
    if (sellerId) {
      await enrollmentsRepo.assignSeller(db, enrollment._id.toHexString(), sellerId.toHexString());
    }

    if (!updated.conversionsApiSent) {
      const config = await siteConfigRepo.getOrCreateSiteConfig(db);
      await sendPurchaseConversion(config, updated);
      await enrollmentsRepo.updatePaymentStatus(db, enrollment._id, {
        paymentStatus: status,
        mpPaymentId,
        conversionsApiSent: true,
      });
    }
  }

  return status;
}

export async function payCheckout(db: Db, enrollmentId: string, formData: PayCheckoutInput) {
  const enrollment = await enrollmentsRepo.findEnrollmentById(db, enrollmentId);
  if (!enrollment) throw new ApiError(404, "Matrícula não encontrada");
  if (enrollment.paymentStatus === "approved") {
    return { status: "approved" as const };
  }

  const client = getMercadoPagoClient();
  const payment = new Payment(client);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const result = await payment.create({
    body: {
      transaction_amount: enrollment.amount,
      description: "Matrícula — Simplifica Doctor",
      payment_method_id: formData.payment_method_id,
      token: formData.token,
      installments: formData.installments ?? 1,
      issuer_id: formData.issuer_id ? Number(formData.issuer_id) : undefined,
      payer: formData.payer,
      external_reference: enrollmentId,
      ...(siteUrl ? { notification_url: `${siteUrl}/api/public/mercadopago/webhook` } : {}),
    },
    requestOptions: { idempotencyKey: enrollmentId },
  });

  const status = await applyPaymentResult(db, enrollment, result.id ? String(result.id) : null, result.status ?? "pending");
  return { status, detail: result.status_detail ?? null, mpPaymentId: result.id ?? null };
}

export async function handleMercadoPagoWebhook(db: Db, paymentId: string) {
  const client = getMercadoPagoClient();
  const payment = new Payment(client);
  const result = await payment.get({ id: paymentId });

  const externalReference = result.external_reference;
  let enrollment = externalReference ? await enrollmentsRepo.findEnrollmentById(db, externalReference) : null;
  if (!enrollment) {
    enrollment = await enrollmentsRepo.findEnrollmentByMpPaymentId(db, paymentId);
  }
  if (!enrollment) {
    console.warn("[mercadopago webhook] pagamento sem matrícula correspondente:", paymentId);
    return;
  }

  await applyPaymentResult(db, enrollment, paymentId, result.status ?? "pending");
}
