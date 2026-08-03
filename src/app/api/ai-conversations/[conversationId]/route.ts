import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as aiAdminService from "@/server/modules/ai-agent/admin-service";

export const GET = withApiHandler<{ params: { conversationId: string } }>(
  async (_request, { params }) => {
    const db = await connectDB();
    const conversation = await aiAdminService.getConversation(db, params.conversationId);
    return NextResponse.json(conversation);
  },
  { permission: "site-config.manage" }
);

export const DELETE = withApiHandler<{ params: { conversationId: string } }>(
  async (_request, { params }) => {
    const db = await connectDB();
    await aiAdminService.deleteConversation(db, params.conversationId);
    return NextResponse.json({ ok: true });
  },
  { permission: "site-config.manage" }
);
