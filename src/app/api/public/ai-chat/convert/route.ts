import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import { markConversationConverted } from "@/server/modules/ai-agent/chat-service";

export const dynamic = "force-dynamic";

const convertSchema = z.object({
  sessionId: z.string().min(1).max(100),
  courseSlug: z.string().min(1).max(200),
});

export const POST = withPublicApiHandler(async (request) => {
  const body = await request.json();
  const input = convertSchema.parse(body);
  const db = await connectDB();
  await markConversationConverted(db, input.sessionId, input.courseSlug);
  return NextResponse.json({ ok: true });
});
