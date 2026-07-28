import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import * as checkoutService from "@/server/modules/enrollments/checkout-service";
import { lookupStudentSchema } from "@/server/modules/enrollments/types";

export const dynamic = "force-dynamic";

export const POST = withPublicApiHandler(async (request) => {
  const body = await request.json();
  const input = lookupStudentSchema.parse(body);
  const db = await connectDB();
  const result = await checkoutService.lookupStudent(db, input.cpf, input.phone);
  return NextResponse.json(result);
});
