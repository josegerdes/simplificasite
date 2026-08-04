import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as ementaService from "@/server/modules/ementa/service";
import { publishEmentaSchema, updateEmentaSchema } from "@/server/modules/ementa/types";

export const GET = withApiHandler<{ params: { courseId: string } }>(
  async (_request, { params }) => {
    const db = await connectDB();
    const ementa = await ementaService.getEmenta(db, params.courseId);
    return NextResponse.json(ementa);
  },
  { permission: "ementa.manage" }
);

export const PUT = withApiHandler<{ params: { courseId: string } }>(
  async (request, { params }) => {
    const body = await request.json();
    const input = updateEmentaSchema.parse(body);
    const db = await connectDB();
    const ementa = await ementaService.saveEmenta(db, params.courseId, input.modules, input.materials);
    return NextResponse.json(ementa);
  },
  { permission: "ementa.manage" }
);

export const PATCH = withApiHandler<{ params: { courseId: string } }>(
  async (request, { params }) => {
    const body = await request.json();
    const input = publishEmentaSchema.parse(body);
    const db = await connectDB();
    const result = await ementaService.setEmentaPublished(db, params.courseId, input.published);
    return NextResponse.json(result);
  },
  { permission: "ementa.manage" }
);
