import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import * as ementaService from "@/server/modules/ementa/service";

export const GET = withPublicApiHandler<{ params: { slug: string } }>(async (_request, { params }) => {
  const db = await connectDB();
  const { buffer, fileName } = await ementaService.getEmentaPdfBuffer(db, params.slug);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
});
