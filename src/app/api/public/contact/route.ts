import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import * as contactService from "@/server/modules/contact/service";
import { createContactMessageSchema } from "@/server/modules/contact/types";

export const dynamic = "force-dynamic";

export const POST = withPublicApiHandler(async (request) => {
  const body = await request.json();
  const input = createContactMessageSchema.parse(body);
  const db = await connectDB();
  const result = await contactService.submitContactMessage(db, input);
  return NextResponse.json(result, { status: 201 });
});
