import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import * as checkoutService from "@/server/modules/enrollments/checkout-service";
import { startCheckoutSchema } from "@/server/modules/enrollments/types";

export const POST = withPublicApiHandler(async (request) => {
  const body = await request.json();
  const input = startCheckoutSchema.parse(body);
  const db = await connectDB();
  const result = await checkoutService.startCheckout(db, input);
  return NextResponse.json(result, { status: 201 });
});
