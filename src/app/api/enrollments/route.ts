import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as adminService from "@/server/modules/enrollments/admin-service";

export const GET = withApiHandler(
  async (request: NextRequest, { session }) => {
    const courseId = request.nextUrl.searchParams.get("courseId") ?? undefined;
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const db = await connectDB();
    const enrollments = await adminService.listEnrollments(db, session, { courseId, status });
    return NextResponse.json(enrollments);
  },
  { permission: "sales.view" }
);
