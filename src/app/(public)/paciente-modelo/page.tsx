"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, HeartHandshake, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api-client";

const INTERESTS = [
  "Facetas / Estética",
  "Implantodontia",
  "Harmonização Orofacial",
  "Prótese Dentária",
  "Dentística Restauradora",
  "Periodontia",
  "Endodontia",
  "Outro",
];

const patientLeadFormSchema = z.object({
  name: z.string().min(3, "Informe seu nome completo"),
  whatsapp: z.string().min(8, "Informe um WhatsApp válido"),
  email: z.string().email("Informe um email válido").optional().or(z.literal("")),
  interest: z.string().optional(),
});
type PatientLeadFormValues = z.infer<typeof patientLeadFormSchema>;

export default function PacienteModeloPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PatientLeadFormValues>({
    resolver: zodResolver(patientLeadFormSchema),
    defaultValues: { name: "", whatsapp: "", email: "", interest: "" },
  });

  async function onSubmit(values: PatientLeadFormValues) {
    setSubmitting(true);
    try {
      await apiFetch("/api/public/patient-lead", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          whatsapp: values.whatsapp,
          email: values.email || null,
          interest: values.interest || null,
        }),
      });
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar seu cadastro");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="py-16">
      <div className="container grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand-teal">
            <Sparkles className="h-4 w-4" />
            Paciente Modelo
          </p>
          <h1 className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
            Faça o tratamento que você quer, com valor acessível
          </h1>
          <p className="mt-4 text-white/70">
            Na Simplifica Doctor, alunos em formação realizam procedimentos reais sob supervisão direta de
            professores especialistas — e você pode ser a pessoa atendida, com condições muito mais acessíveis do
            que num consultório particular.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex gap-3">
              <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" />
              <div>
                <p className="font-heading text-sm font-semibold text-white">Sempre supervisionado</p>
                <p className="mt-0.5 text-sm text-white/60">
                  Todo atendimento é acompanhado de perto por um professor especialista na área.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" />
              <div>
                <p className="font-heading text-sm font-semibold text-white">Vagas limitadas por turma</p>
                <p className="mt-0.5 text-sm text-white/60">
                  Cada curso tem um número reduzido de vagas de paciente modelo — cadastre seu interesse e nosso
                  time avisa assim que abrir uma compatível com o seu caso.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" />
              <div>
                <p className="font-heading text-sm font-semibold text-white">Condição facilitada</p>
                <p className="mt-0.5 text-sm text-white/60">
                  Por fazer parte do processo de aprendizado, o valor do tratamento é bem mais acessível que o de
                  mercado.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-brand-teal" />
              <p className="font-heading text-lg font-semibold text-white">Cadastro enviado!</p>
              <p className="text-white/70">
                Assim que abrir uma vaga de paciente modelo compatível com o seu interesse, nosso time entra em
                contato pelo WhatsApp.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form className="space-y-4 [&_label]:text-white/90" onSubmit={form.handleSubmit(onSubmit)}>
                <h2 className="font-heading text-lg font-semibold text-white">Quero ser paciente modelo</h2>
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
                <FormField
                  control={form.control}
                  name="interest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual tratamento te interessa? (opcional)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INTERESTS.map((interest) => (
                            <SelectItem key={interest} value={interest}>
                              {interest}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button type="submit" variant="cta" size="lg" className="w-full" loading={submitting}>
                  Quero ser paciente modelo
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </main>
  );
}
