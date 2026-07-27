import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as coursesService from "@/server/modules/courses/service";
import { updateCourseSchema } from "@/server/modules/courses/types";

export const GET = withApiHandler<{ params: { courseId: string } }>(
  async (_request, { params }) => {
    const db = await connectDB();
    const course = await coursesService.getCourseAdmin(db, params.courseId);
    return NextResponse.json(course);
  },
  { permission: "courses.view" }
);

export const PATCH = withApiHandler<{ params: { courseId: string } }>(
  async (request, { params }) => {
    const body = await request.json();
    const input = updateCourseSchema.parse(body);
    const db = await connectDB();
    const course = await coursesService.updateCourse(db, params.courseId, input);
    return NextResponse.json(course);
  },
  { permission: "courses.manage" }
);

export const DELETE = withApiHandler<{ params: { courseId: string } }>(
  async (_request, { params }) => {
    const db = await connectDB();
    await coursesService.deleteCourse(db, params.courseId);
    return NextResponse.json({ ok: true });
  },
  { permission: "courses.manage" }
);
