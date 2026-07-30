import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import { ApiError } from "@/server/auth/guards";
import * as coursesRepo from "@/server/modules/courses/repository";
import { externalLeadSchema } from "@/server/modules/external-leads/types";
import { submitExternalLead } from "@/server/modules/external-leads/service";

export const dynamic = "force-dynamic";

const courseLeadSchema = externalLeadSchema.extend({
  courseSlug: z.string().min(1).max(200),
});

export const POST = withPublicApiHandler(async (request) => {
  const body = await request.json();
  const input = courseLeadSchema.parse(body);

  const db = await connectDB();
  const course = await coursesRepo.findCourseBySlug(db, input.courseSlug);
  if (!course) throw new ApiError(404, "Curso não encontrado");

  await submitExternalLead(input, {
    leadType: "student",
    originLabel: `Simplifica Doctor - Site (Curso: ${course.name})`,
  });
  return NextResponse.json({ ok: true }, { status: 201 });
});
