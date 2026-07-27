import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import * as checkoutService from "@/server/modules/enrollments/checkout-service";
import { payCheckoutSchema } from "@/server/modules/enrollments/types";

export const POST = withPublicApiHandler<{ params: { enrollmentId: string } }>(async (request, { params }) => {
  const body = await request.json();
  const input = payCheckoutSchema.parse(body);
  const db = await connectDB();
  const result = await checkoutService.payCheckout(db, params.enrollmentId, input);
  return NextResponse.json(result);
});
