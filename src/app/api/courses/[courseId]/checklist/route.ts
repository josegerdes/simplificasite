import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as coursesService from "@/server/modules/courses/service";
import { updateChecklistSchema } from "@/server/modules/courses/types";

export const PUT = withApiHandler<{ params: { courseId: string } }>(
  async (request, { params }) => {
    const body = await request.json();
    const input = updateChecklistSchema.parse(body);
    const db = await connectDB();
    const course = await coursesService.updateChecklist(db, params.courseId, input.items);
    return NextResponse.json(course);
  },
  { permission: "courses.manage" }
);
