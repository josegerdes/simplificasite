import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { ApiError } from "@/server/auth/guards";
import { chatRequestSchema } from "@/server/modules/ai-agent/types";
import { streamChatReply } from "@/server/modules/ai-agent/chat-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = chatRequestSchema.parse(body);
    const db = await connectDB();
    const stream = await streamChatReply(db, input);
    return new NextResponse(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
