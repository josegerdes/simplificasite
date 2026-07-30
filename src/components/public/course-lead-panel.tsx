"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarClock, CheckCircle2, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { trackPixelEvent } from "@/components/public/pixel-script";
import type { PublicCourseCardData } from "@/components/public/course-card";

const leadFormSchema = z.object({
  name: z.string().min(3, "Informe seu nome completo"),
  email: z.string().email("Informe um email válido").optional().or(z.literal("")),
  whatsapp: z.string().min(8, "Informe um WhatsApp válido"),
});
type LeadFormValues = z.infer<typeof leadFormSchema>;

/** Mesmo card/CTA visual do CheckoutPanel, mas sem Mercado Pago — curso configurado como
 *  "somente captar interesse" só pede nome/whatsapp/email e manda pro CRM externo
 *  (SimplificaLink), pro time comercial fechar a venda por fora do site. */
export function CourseLeadPanel({ course }: { course: PublicCourseCardData }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { name: "", email: "", whatsapp: "" },
  });

  function openDialog() {
    trackPixelEvent("Lead", { content_ids: [course.slug], currency: "BRL", value: 0 });
    setDone(false);
    form.reset();
    setOpen(true);
  }

  async function submit(values: LeadFormValues) {
    setSubmitting(true);
    try {
      await apiFetch("/api/public/course-lead", {
        method: "POST",
        body: JSON.stringify({
          courseSlug: course.slug,
          name: values.name,
          email: values.email || null,
          whatsapp: values.whatsapp,
          interest: course.name,
        }),
      });
      setDone(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar seu contato");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="sticky top-24 hidden rounded-xl border border-white/10 bg-white/5 p-6 lg:block">
        <p className="font-heading text-lg font-bold text-white">Quero saber mais</p>
        <p className="mt-1 text-sm text-white/60">Deixe seu contato e nosso time explica turma, valores e formas de pagamento.</p>

        <div className="my-5 space-y-2 text-sm text-white/70">
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-teal" />
            Sem compromisso — é só um contato
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-teal" />
            {course.seatsRemaining !== null ? `${course.seatsRemaining} vagas restantes` : "Vagas abertas"}
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-brand-teal" />
            Nosso time responde rapidinho
          </p>
        </div>

        <Button size="xl" variant="cta" className="w-full" disabled={course.soldOut} onClick={openDialog}>
          {course.soldOut ? "Vagas esgotadas" : "Tenho interesse"}
        </Button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-brand-ink/95 p-3 backdrop-blur lg:hidden">
        <Button size="lg" variant="cta" className="w-full" disabled={course.soldOut} onClick={openDialog}>
          {course.soldOut ? "Vagas esgotadas" : "Tenho interesse — fale com a gente"}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-brand-teal" />
              <p className="font-heading text-lg font-semibold text-white">Contato enviado!</p>
              <p className="text-sm text-white/60">Nosso time vai falar com você em breve sobre {course.name}.</p>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Quero saber mais sobre {course.name}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
                  <FormField
                    control={form.control}
                    name="name"
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
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input inputMode="tel" placeholder="21999999999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (opcional)</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" variant="cta" className="w-full" loading={submitting}>
                    Enviar
                  </Button>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
