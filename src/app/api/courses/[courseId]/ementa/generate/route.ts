import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as ementaService from "@/server/modules/ementa/service";
import { generateEmentaSchema } from "@/server/modules/ementa/types";

export const POST = withApiHandler<{ params: { courseId: string } }>(
  async (request, { params }) => {
    const body = await request.json().catch(() => ({}));
    const input = generateEmentaSchema.parse(body);
    const db = await connectDB();
    const ementa = await ementaService.generateEmenta(db, params.courseId, input.sourceText ?? undefined);
    return NextResponse.json(ementa);
  },
  { permission: "ementa.manage" }
);
