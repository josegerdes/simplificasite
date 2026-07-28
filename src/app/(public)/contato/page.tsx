"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, HelpCircle, Mail, MessageSquareWarning, ShoppingBag, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";

const CATEGORIES = [
  { value: "duvida", label: "Dúvidas sobre cursos", icon: HelpCircle },
  { value: "vendas", label: "Vendas / Matrícula", icon: ShoppingBag },
  { value: "financeiro", label: "Financeiro", icon: Wallet },
  { value: "reclamacao", label: "Reclamação", icon: MessageSquareWarning },
] as const;

const contactFormSchema = z.object({
  category: z.enum(["duvida", "vendas", "financeiro", "reclamacao"], { required_error: "Selecione um assunto" }),
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("Informe um email válido"),
  phone: z.string().optional(),
  message: z.string().min(5, "Escreva sua mensagem"),
});
type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setSubmitting(true);
    try {
      await apiFetch("/api/public/contact", {
        method: "POST",
        body: JSON.stringify({ ...values, phone: values.phone || null }),
      });
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar sua mensagem");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="py-16">
      <div className="container max-w-2xl">
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">Fale conosco</h1>
        <p className="mt-3 text-white/60">
          Dúvidas sobre um curso, sua matrícula, financeiro ou alguma reclamação — escolha o assunto e escreva pra
          gente. Também respondemos rápido pelo chat do vendedor virtual, no canto da tela.
        </p>

        {sent ? (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-brand-teal/30 bg-brand-teal/10 p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-brand-teal" />
            <p className="font-heading text-lg font-semibold text-white">Mensagem enviada!</p>
            <p className="text-white/70">Nosso time vai te responder em breve pelo email informado.</p>
          </div>
        ) : (
          <Form {...form}>
            <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o assunto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <span className="flex items-center gap-2">
                              <category.icon className="h-4 w-4" />
                              {category.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
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
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="cta" size="lg" className="w-full sm:w-auto" loading={submitting}>
                <Mail className="h-4 w-4" />
                Enviar mensagem
              </Button>
            </form>
          </Form>
        )}
      </div>
    </main>
  );
}
