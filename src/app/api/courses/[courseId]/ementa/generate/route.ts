import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as ementaService from "@/server/modules/ementa/service";

export const POST = withApiHandler<{ params: { courseId: string } }>(
  async (_request, { params }) => {
    const db = await connectDB();
    const ementa = await ementaService.generateEmenta(db, params.courseId);
    return NextResponse.json(ementa);
  },
  { permission: "ementa.manage" }
);
