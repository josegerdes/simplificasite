import { z } from "zod";

const utmValue = z.string().max(200).nullable().default(null);
const utmSchema = z
  .object({
    source: utmValue,
    medium: utmValue,
    campaign: utmValue,
    content: utmValue,
    term: utmValue,
  })
  .default({});

export const trackAbandonedCartSchema = z.object({
  sessionId: z.string().min(1).max(100),
  courseSlug: z.string().min(1).max(200),
  step: z.enum(["identify", "details", "payment"]),
  studentName: z.string().max(200).nullable().default(null),
  studentEmail: z.string().max(200).nullable().default(null),
  studentPhone: z.string().max(30).nullable().default(null),
  studentCpf: z.string().max(20).nullable().default(null),
  utm: utmSchema,
});
export type TrackAbandonedCartInput = z.infer<typeof trackAbandonedCartSchema>;

export const addAbandonedCartNoteSchema = z.object({
  note: z.string().min(1).max(2000),
});
export type AddAbandonedCartNoteInput = z.infer<typeof addAbandonedCartNoteSchema>;

export const updateAbandonedCartSchema = z.object({
  status: z.enum(["open", "contacted", "converted", "lost"]),
});
export type UpdateAbandonedCartInput = z.infer<typeof updateAbandonedCartSchema>;
