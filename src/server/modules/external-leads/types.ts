import { z } from "zod";

export const externalLeadSchema = z.object({
  name: z.string().min(2, "Informe seu nome").max(200),
  email: z.string().email("Informe um email válido").max(200).nullable().default(null),
  whatsapp: z.string().min(8, "Informe um WhatsApp válido").max(30),
  interest: z.string().max(200).nullable().default(null),
});
export type ExternalLeadInput = z.infer<typeof externalLeadSchema>;
