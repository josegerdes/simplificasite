import { z } from "zod";

export const ementaModuleSchema = z.object({
  title: z.string().min(1),
  topics: z.array(z.string().min(1)).default([]),
});

export const updateEmentaSchema = z.object({
  modules: z.array(ementaModuleSchema),
});
export type UpdateEmentaInput = z.infer<typeof updateEmentaSchema>;

export const publishEmentaSchema = z.object({
  published: z.boolean(),
});
export type PublishEmentaInput = z.infer<typeof publishEmentaSchema>;

export const generateEmentaSchema = z.object({
  sourceText: z.string().max(20000).nullable().optional(),
});
export type GenerateEmentaInput = z.infer<typeof generateEmentaSchema>;
