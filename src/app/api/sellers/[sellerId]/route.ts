import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as sellersService from "@/server/modules/sellers/service";
import { updateSellerSchema } from "@/server/modules/sellers/types";

export const PATCH = withApiHandler<{ params: { sellerId: string } }>(
  async (request, { params }) => {
    const body = await request.json();
    const input = updateSellerSchema.parse(body);
    const db = await connectDB();
    const seller = await sellersService.updateSeller(db, params.sellerId, input);
    return NextResponse.json(seller);
  },
  { permission: "people.manage" }
);

export const DELETE = withApiHandler<{ params: { sellerId: string } }>(
  async (_request, { params }) => {
    const db = await connectDB();
    await sellersService.deleteSeller(db, params.sellerId);
    return NextResponse.json({ ok: true });
  },
  { permission: "people.manage" }
);
