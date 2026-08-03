import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import { getConversationForResume } from "@/server/modules/ai-agent/chat-service";

export const dynamic = "force-dynamic";

export const GET = withPublicApiHandler(async (request: NextRequest) => {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId || sessionId.length > 100) {
    return NextResponse.json({ found: false });
  }

  const db = await connectDB();
  const conversation = await getConversationForResume(db, sessionId);
  if (!conversation) return NextResponse.json({ found: false });

  return NextResponse.json({ found: true, ...conversation });
});
