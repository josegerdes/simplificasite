import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as aiAdminService from "@/server/modules/ai-agent/admin-service";

export const GET = withApiHandler(
  async () => {
    const db = await connectDB();
    const conversations = await aiAdminService.listConversations(db);
    return NextResponse.json(conversations);
  },
  { permission: "site-config.manage" }
);
