import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import { ApiError } from "@/server/auth/guards";
import * as coursesRepo from "@/server/modules/courses/repository";
import { generateCourseField } from "@/server/modules/courses/ai-assist";

const bodySchema = z.object({
  field: z.enum(["shortDescription", "longDescription", "highlights"]),
});

export const POST = withApiHandler<{ params: { courseId: string } }>(
  async (request, { params }) => {
    const body = await request.json();
    const input = bodySchema.parse(body);

    const db = await connectDB();
    const course = await coursesRepo.findCourseById(db, params.courseId);
    if (!course) throw new ApiError(404, "Curso não encontrado");

    const currentValue =
      input.field === "highlights" ? course.highlights.join(", ") : input.field === "shortDescription" ? course.shortDescription : course.longDescription;

    const result = await generateCourseField({
      field: input.field,
      courseName: course.name,
      modality: course.modality,
      workloadHours: course.workloadHours,
      currentValue,
    });

    return NextResponse.json({ value: result });
  },
  { permission: "courses.manage" }
);
