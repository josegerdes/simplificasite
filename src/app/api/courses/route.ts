import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as coursesService from "@/server/modules/courses/service";
import { createCourseSchema } from "@/server/modules/courses/types";

export const GET = withApiHandler(
  async () => {
    const db = await connectDB();
    const courses = await coursesService.listCoursesAdmin(db);
    return NextResponse.json(courses);
  },
  { permission: "courses.view" }
);

export const POST = withApiHandler(
  async (request) => {
    const body = await request.json();
    const input = createCourseSchema.parse(body);
    const db = await connectDB();
    const course = await coursesService.createCourse(db, input);
    return NextResponse.json(course, { status: 201 });
  },
  { permission: "courses.manage" }
);
