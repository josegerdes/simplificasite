"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarClock, ShieldCheck, Users } from "lucide-react";

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
import type { PublicCourseCardData } from "@/components/public/course-card";

const checkoutFormSchema = z.object({
  studentName: z.string().min(3, "Informe seu nome completo"),
  studentEmail: z.string().email("Informe um email válido"),
  studentPhone: z.string().min(8, "Informe um telefone válido"),
  studentCpf: z.string().min(11, "Informe um CPF válido"),
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

export function CheckoutPanel({ course }: { course: PublicCourseCardData & { modality?: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "payment">("form");
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      studentName: "",
      studentEmail: "",
      studentPhone: "",
      studentCpf: "",
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

  function openCheckout() {
    trackPixelEvent("InitiateCheckout", { content_ids: [course.slug], currency: "BRL", value: course.price });
    setOpen(true);
    setStep("form");
  }

  async function onSubmitForm(values: CheckoutFormValues) {
    setSubmitting(true);
    try {
      const result = await apiFetch<CheckoutSession>("/api/public/checkout", {
        method: "POST",
        body: JSON.stringify({
          courseSlug: course.slug,
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
      <div className="sticky top-24 rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4">
          {course.originalPrice && course.originalPrice > course.price && (
            <p className="text-sm text-white/40 line-through">{formatBRL(course.originalPrice)}</p>
          )}
          <p className="text-3xl font-bold text-brand-teal">{formatBRL(course.price)}</p>
          <p className="text-sm text-white/60">Valor da matrícula — o restante é combinado com nosso time</p>
        </div>

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{step === "form" ? "Garanta sua vaga" : "Pagamento"}</DialogTitle>
          </DialogHeader>

          {step === "form" && (
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmitForm)}>
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
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
                  <FormField
                    control={form.control}
                    name="studentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="21999999999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="studentCpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                <div className="grid grid-cols-3 gap-3">
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
            </Form>
          )}

          {step === "payment" && session && (
            <PaymentBrick enrollmentId={session.enrollmentId} amount={session.amount} payerEmail={session.studentEmail} onResult={handlePaymentResult} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
