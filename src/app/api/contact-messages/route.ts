import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as contactService from "@/server/modules/contact/service";

export const GET = withApiHandler(
  async () => {
    const db = await connectDB();
    const messages = await contactService.listContactMessages(db);
    return NextResponse.json(messages);
  },
  { permission: "contact.manage" }
);
