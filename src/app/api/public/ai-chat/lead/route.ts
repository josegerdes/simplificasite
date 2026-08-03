import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import { registerChatLead } from "@/server/modules/ai-agent/chat-service";
import { chatLeadInfoSchema } from "@/server/modules/ai-agent/types";

export const dynamic = "force-dynamic";

const registerLeadSchema = z.object({
  sessionId: z.string().min(1).max(100),
  personaId: z.string().min(1).max(100).nullable().default(null),
  leadInfo: chatLeadInfoSchema,
});

export const POST = withPublicApiHandler(async (request) => {
  const body = await request.json();
  const input = registerLeadSchema.parse(body);
  const db = await connectDB();
  await registerChatLead(db, input.sessionId, input.personaId, input.leadInfo);
  return NextResponse.json({ ok: true });
});
