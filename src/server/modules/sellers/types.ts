import { z } from "zod";

export const createSellerSchema = z.object({
  userId: z.string().min(1, "Selecione o usuário vinculado"),
  phone: z.string().nullable().default(null),
});
export type CreateSellerInput = z.infer<typeof createSellerSchema>;

export const updateSellerSchema = z.object({
  phone: z.string().nullable().optional(),
  active: z.boolean().optional(),
});
export type UpdateSellerInput = z.infer<typeof updateSellerSchema>;
