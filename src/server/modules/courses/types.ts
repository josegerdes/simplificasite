import { z } from "zod";

export const createCourseSchema = z.object({
  name: z.string().min(2, "Informe o nome do curso"),
  modality: z.enum(["PRESENCIAL", "ONLINE"]),
  shortDescription: z.string().min(1, "Informe uma descrição curta"),
  longDescription: z.string().default(""),
  highlights: z.array(z.string()).default([]),
  instructors: z.array(z.string()).default([]),
  coverImageUrl: z.string().nullable().default(null),
  workloadHours: z.coerce.number().int().positive("Informe a carga horária"),
  location: z.string().nullable().default(null),
  startDate: z.string().nullable().default(null),
  price: z.coerce.number().min(0, "Informe o valor da matrícula"),
  originalPrice: z.coerce.number().min(0).nullable().default(null),
  promoDeadline: z.coerce.date().nullable().default(null),
  seatsLimit: z.coerce.number().int().positive().nullable().default(null),
});
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: z.enum(["DRAFT", "PUBLISHED", "SOLD_OUT", "CLOSED"]).optional(),
  saleMode: z.enum(["checkout", "lead"]).optional(),
  pixelOverride: z.object({ enabled: z.boolean(), pixelId: z.string().nullable() }).optional(),
});
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const checklistItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  done: z.boolean(),
  isDefault: z.boolean(),
});

export const updateChecklistSchema = z.object({
  items: z.array(checklistItemSchema),
});
export type UpdateChecklistInput = z.infer<typeof updateChecklistSchema>;
