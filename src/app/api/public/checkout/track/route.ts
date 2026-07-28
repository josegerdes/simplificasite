import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import * as abandonedCartsService from "@/server/modules/abandoned-carts/service";
import { trackAbandonedCartSchema } from "@/server/modules/abandoned-carts/types";

export const dynamic = "force-dynamic";

export const POST = withPublicApiHandler(async (request) => {
  const body = await request.json();
  const input = trackAbandonedCartSchema.parse(body);
  const db = await connectDB();
  await abandonedCartsService.trackCheckoutProgress(db, input);
  return NextResponse.json({ ok: true });
});
