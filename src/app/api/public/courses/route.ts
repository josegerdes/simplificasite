import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import * as coursesService from "@/server/modules/courses/service";
import { CourseModality } from "@/server/db/schema";

export const GET = withPublicApiHandler(async (request: NextRequest) => {
  const modalityParam = request.nextUrl.searchParams.get("modality");
  const modality =
    modalityParam === "PRESENCIAL" || modalityParam === "ONLINE" ? (modalityParam as CourseModality) : undefined;
  const db = await connectDB();
  const courses = await coursesService.listPublicCourses(db, modality);
  return NextResponse.json(courses);
});
