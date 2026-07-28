import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as contactService from "@/server/modules/contact/service";
import { updateContactMessageSchema } from "@/server/modules/contact/types";

export const PATCH = withApiHandler<{ params: { messageId: string } }>(
  async (request, { params }) => {
    const body = await request.json();
    const input = updateContactMessageSchema.parse(body);
    const db = await connectDB();
    const message = await contactService.updateContactMessageStatus(db, params.messageId, input);
    return NextResponse.json(message);
  },
  { permission: "contact.manage" }
);
