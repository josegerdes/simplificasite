import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import * as coursesService from "@/server/modules/courses/service";

export const GET = withPublicApiHandler<{ params: { slug: string } }>(async (_request, { params }) => {
  const db = await connectDB();
  const course = await coursesService.getPublicCourseBySlug(db, params.slug);
  return NextResponse.json(course);
});
