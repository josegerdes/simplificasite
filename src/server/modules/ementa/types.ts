import { z } from "zod";

export const ementaModuleSchema = z.object({
  title: z.string().min(1),
  topics: z.array(z.string().min(1)).default([]),
});

export const updateEmentaSchema = z.object({
  modules: z.array(ementaModuleSchema),
  materials: z.array(z.string()).default([]),
});
export type UpdateEmentaInput = z.infer<typeof updateEmentaSchema>;

export const publishEmentaSchema = z.object({
  published: z.boolean(),
});
export type PublishEmentaInput = z.infer<typeof publishEmentaSchema>;

export const generateEmentaSchema = z.object({
  sourceText: z.string().max(20000).nullable().optional(),
  // O que está na tela agora (inclui edição manual ainda não salva) — se vier, usa isso pra
  // "melhorar" em vez de buscar a última versão salva no banco, que pode estar desatualizada
  // em relação ao que o admin já editou na tela.
  currentModules: z.array(ementaModuleSchema).optional(),
  currentMaterials: z.array(z.string()).optional(),
});
export type GenerateEmentaInput = z.infer<typeof generateEmentaSchema>;
