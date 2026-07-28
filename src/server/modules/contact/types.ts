import { z } from "zod";

export const contactCategoryEnum = z.enum(["duvida", "vendas", "financeiro", "reclamacao"]);

export const createContactMessageSchema = z.object({
  category: contactCategoryEnum,
  name: z.string().min(2, "Informe seu nome").max(200),
  email: z.string().email("Informe um email válido").max(200),
  phone: z.string().max(30).nullable().default(null),
  message: z.string().min(5, "Escreva sua mensagem").max(5000),
});
export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;

export const updateContactMessageSchema = z.object({
  status: z.enum(["new", "in_progress", "resolved"]),
});
export type UpdateContactMessageInput = z.infer<typeof updateContactMessageSchema>;
