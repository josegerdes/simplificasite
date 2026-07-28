"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, Lock, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api-client";
import { formatBRL } from "@/lib/format";
import { readUtmFromLocation } from "@/lib/utm";
import { trackPixelEvent } from "@/components/public/pixel-script";
import { PaymentBrick } from "@/components/public/payment-brick";
import { CountdownTimer } from "@/components/public/countdown-timer";
import { randomId } from "@/lib/random-id";
import type { PublicCourseCardData } from "@/components/public/course-card";

const checkoutFormSchema = z.object({
  studentCpf: z.string().min(11, "Informe um CPF válido"),
  studentPhone: z.string().min(8, "Informe um telefone válido"),
  studentName: z.string().min(3, "Informe seu nome completo"),
  studentEmail: z.string().email("Informe um email válido"),
  studentRg: z.string().optional(),
  studentBornDate: z.string().optional(),
  studentCivilState: z.string().optional(),
  postalCode: z.string().optional(),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});
type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

interface CheckoutSession {
  enrollmentId: string;
  amount: number;
  courseName: string;
  studentEmail: string;
  purchaseEventId: string;
}

function getCheckoutSessionId(): string {
  const key = "sdv_checkout_session";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = randomId();
    window.localStorage.setItem(key, id);
  }
  return id;
}

interface LookupResponse {
  found: boolean;
  profile?: {
    studentName: string;
    studentEmail: string;
    studentRg: string | null;
    studentBornDate: string | null;
    studentCivilState: string | null;
    address: {
      postalCode: string | null;
      street: string | null;
      neighborhood: string | null;
      city: string | null;
      state: string | null;
    };
  };
}

export function CheckoutPanel({ course }: { course: PublicCourseCardData & { modality?: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"identify" | "details" | "payment">("identify");
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const trackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      studentCpf: "",
      studentPhone: "",
      studentName: "",
      studentEmail: "",
      studentRg: "",
      studentBornDate: "",
      studentCivilState: "",
      postalCode: "",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  useEffect(() => {
    setSessionId(getCheckoutSessionId());
  }, []);

  // Salva progressivamente o que já foi digitado (nome, email, telefone, CPF) enquanto a
  // pessoa preenche — sem isso, quem abandona o checkout no meio some sem deixar rastro
  // nenhum pro vendedor tentar contato manual depois (ver /abandoned-carts no admin).
  function trackProgress(values: Partial<CheckoutFormValues>) {
    if (!sessionId) return;
    if (!values.studentName && !values.studentEmail && !values.studentPhone && !values.studentCpf) return;
    fetch("/api/public/checkout/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        courseSlug: course.slug,
        step,
        studentName: values.studentName || null,
        studentEmail: values.studentEmail || null,
        studentPhone: values.studentPhone || null,
        studentCpf: values.studentCpf || null,
        utm: readUtmFromLocation(),
      }),
    }).catch(() => {
      // best-effort — nunca deve travar ou avisar erro no checkout real
    });
  }

  useEffect(() => {
    if (!sessionId || !open || step === "payment") return;
    const subscription = form.watch((values) => {
      if (trackTimer.current) clearTimeout(trackTimer.current);
      trackTimer.current = setTimeout(() => trackProgress(values), 900);
    });
    return () => {
      subscription.unsubscribe();
      if (trackTimer.current) clearTimeout(trackTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, open, step]);

  function openCheckout() {
    trackPixelEvent("InitiateCheckout", { content_ids: [course.slug], currency: "BRL", value: course.price });
    setOpen(true);
    setStep("identify");
    setWelcomeName(null);
  }

  async function submitCheckout(values: CheckoutFormValues) {
    setSubmitting(true);
    try {
      const result = await apiFetch<CheckoutSession>("/api/public/checkout", {
        method: "POST",
        body: JSON.stringify({
          courseSlug: course.slug,
          sessionId,
          studentName: values.studentName,
          studentEmail: values.studentEmail,
          studentPhone: values.studentPhone,
          studentCpf: values.studentCpf,
          studentRg: values.studentRg || null,
          studentBornDate: values.studentBornDate || null,
          studentCivilState: values.studentCivilState || null,
          address: {
            postalCode: values.postalCode || null,
            street: values.street || null,
            neighborhood: values.neighborhood || null,
            city: values.city || null,
            state: values.state || null,
          },
          utm: readUtmFromLocation(),
        }),
      });
      setSession(result);
      setStep("payment");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível iniciar a matrícula");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleIdentifyContinue() {
    const valid = await form.trigger(["studentCpf", "studentPhone"]);
    if (!valid) return;

    setLookingUp(true);
    try {
      const { studentCpf, studentPhone } = form.getValues();
      const result = await apiFetch<LookupResponse>("/api/public/checkout/lookup", {
        method: "POST",
        body: JSON.stringify({ cpf: studentCpf, phone: studentPhone }),
      });

      if (result.found && result.profile) {
        const p = result.profile;
        form.setValue("studentName", p.studentName);
        form.setValue("studentEmail", p.studentEmail);
        form.setValue("studentRg", p.studentRg ?? "");
        form.setValue("studentBornDate", p.studentBornDate ?? "");
        form.setValue("studentCivilState", p.studentCivilState ?? "");
        form.setValue("postalCode", p.address.postalCode ?? "");
        form.setValue("street", p.address.street ?? "");
        form.setValue("neighborhood", p.address.neighborhood ?? "");
        form.setValue("city", p.address.city ?? "");
        form.setValue("state", p.address.state ?? "");
        setWelcomeName(p.studentName.split(" ")[0] ?? p.studentName);
        // Já temos tudo que precisamos — pula direto pro pagamento em vez de pedir de novo.
        await submitCheckout(form.getValues());
      } else {
        setStep("details");
      }
    } catch {
      // Se a busca falhar, não trava o fluxo — só cai no formulário completo.
      setStep("details");
    } finally {
      setLookingUp(false);
    }
  }

  function handlePaymentResult(status: string) {
    if (!session) return;
    if (status === "approved" || status === "pending" || status === "in_process") {
      if (status === "approved") {
        trackPixelEvent("Purchase", { currency: "BRL", value: session.amount }, session.purchaseEventId);
      }
      router.push(`/matricula/sucesso?status=${status}&curso=${encodeURIComponent(session.courseName)}`);
    } else {
      toast.error("Pagamento não aprovado — verifique os dados do cartão ou tente outro método");
    }
  }

  return (
    <>
      {/* Desktop: card fixo na coluna lateral. No mobile essa coluna vira a última coisa da
          página (grid empilhado) — sem a barra fixa abaixo, o CTA ficaria fora da tela até o
          visitante rolar tudo, o que mata conversão em tráfego de anúncio (majoritariamente mobile). */}
      <div className="sticky top-24 hidden rounded-xl border border-white/10 bg-white/5 p-6 lg:block">
        <div className="mb-4">
          {course.originalPrice && course.originalPrice > course.price && (
            <p className="text-sm text-white/40 line-through">{formatBRL(course.originalPrice)}</p>
          )}
          <p className="text-3xl font-bold text-brand-teal">{formatBRL(course.price)}</p>
          <p className="text-sm text-white/60">Valor da matrícula — o restante é combinado com nosso time</p>
        </div>

        {course.promoDeadline && (
          <div className="mb-4">
            <CountdownTimer deadline={course.promoDeadline} />
          </div>
        )}

        <div className="mb-5 space-y-2 text-sm text-white/70">
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-teal" />
            Pagamento seguro via Mercado Pago
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-teal" />
            {course.seatsRemaining !== null ? `${course.seatsRemaining} vagas restantes` : "Vagas abertas"}
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-brand-teal" />
            Nosso time entra em contato logo após a matrícula
          </p>
        </div>

        <Button size="xl" variant="cta" className="w-full" disabled={course.soldOut} onClick={openCheckout}>
          {course.soldOut ? "Vagas esgotadas" : "Garantir minha vaga"}
        </Button>
      </div>

      {/* Mobile: barra fixa no rodapé, sempre visível — o equivalente ao card acima, mas sem
          depender de scroll pra aparecer. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-brand-ink/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            {course.originalPrice && course.originalPrice > course.price && (
              <p className="truncate text-xs text-white/40 line-through">{formatBRL(course.originalPrice)}</p>
            )}
            <p className="font-heading text-xl font-bold text-brand-teal">{formatBRL(course.price)}</p>
          </div>
          <Button size="lg" variant="cta" className="shrink-0" disabled={course.soldOut} onClick={openCheckout}>
            {course.soldOut ? "Esgotado" : "Garantir vaga"}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === "identify" && "Garanta sua vaga"}
              {step === "details" && "Só mais alguns dados"}
              {step === "payment" && "Pagamento"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            {step === "identify" && (
              <div className="space-y-4">
                <p className="text-sm text-white/60">
                  Informe CPF e celular — se você já comprou com a gente, preenchemos o resto automaticamente.
                </p>
                <FormField
                  control={form.control}
                  name="studentCpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          placeholder="000.000.000-00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value.replace(/\D/g, "").length >= 11) form.setFocus("studentPhone");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular / WhatsApp</FormLabel>
                      <FormControl>
                        <Input inputMode="tel" placeholder="21999999999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="button" variant="cta" className="w-full" loading={lookingUp} onClick={handleIdentifyContinue}>
                  Continuar
                </Button>

                <p className="flex items-start gap-1.5 text-xs text-white/40">
                  <Lock className="mt-0.5 h-3 w-3 shrink-0" />
                  Usamos seu CPF e celular juntos só para localizar um cadastro existente e agilizar sua
                  matrícula, conforme a LGPD — seus dados não são compartilhados com terceiros.
                </p>
              </div>
            )}

            {step === "details" && (
              <form className="space-y-4" onSubmit={form.handleSubmit(submitCheckout)}>
                <button
                  type="button"
                  onClick={() => setStep("identify")}
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-white"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Voltar
                </button>

                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onBlur={(e) => {
                            field.onBlur();
                            if (e.target.value.trim().split(" ").filter(Boolean).length >= 2) form.setFocus("studentEmail");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="studentRg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RG</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="studentBornDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nascimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="studentCivilState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado civil</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                          <SelectItem value="casado">Casado(a)</SelectItem>
                          <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                          <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                          <SelectItem value="uniao_estavel">União estável</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF</FormLabel>
                        <FormControl>
                          <Input maxLength={2} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua e número</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" variant="cta" className="w-full" loading={submitting}>
                  Continuar para pagamento — {formatBRL(course.price)}
                </Button>
              </form>
            )}
          </Form>

          {step === "payment" && session && (
            <div className="space-y-3">
              {welcomeName && (
                <p className="rounded-md bg-brand-teal/10 px-3 py-2 text-sm text-brand-teal">
                  Bem-vindo(a) de volta, {welcomeName}! Já preenchemos seus dados — falta só o pagamento.
                </p>
              )}
              <PaymentBrick
                enrollmentId={session.enrollmentId}
                amount={session.amount}
                payerEmail={session.studentEmail}
                onResult={handlePaymentResult}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
