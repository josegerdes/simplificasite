import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const chatRequestSchema = z.object({
  sessionId: z.string().min(1).max(100),
  personaId: z.string().min(1).max(100).nullable().default(null),
  messages: z.array(chatMessageSchema).min(1).max(30),
});
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
