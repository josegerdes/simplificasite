import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as adminService from "@/server/modules/enrollments/admin-service";
import { updateEnrollmentSchema } from "@/server/modules/enrollments/types";

export const PATCH = withApiHandler<{ params: { enrollmentId: string } }>(
  async (request, { params, session }) => {
    const body = await request.json();
    const input = updateEnrollmentSchema.parse(body);
    const db = await connectDB();
    const enrollment = await adminService.updateEnrollment(db, session, params.enrollmentId, input);
    return NextResponse.json(enrollment);
  },
  { permission: "sales.manage" }
);
