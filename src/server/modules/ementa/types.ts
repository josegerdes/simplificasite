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
