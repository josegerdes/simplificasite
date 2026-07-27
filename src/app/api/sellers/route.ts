import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as sellersService from "@/server/modules/sellers/service";
import { createSellerSchema } from "@/server/modules/sellers/types";

export const GET = withApiHandler(
  async () => {
    const db = await connectDB();
    const sellers = await sellersService.listSellers(db);
    return NextResponse.json(sellers);
  },
  { permission: "people.manage" }
);

export const POST = withApiHandler(
  async (request) => {
    const body = await request.json();
    const input = createSellerSchema.parse(body);
    const db = await connectDB();
    const seller = await sellersService.createSeller(db, input);
    return NextResponse.json(seller, { status: 201 });
  },
  { permission: "people.manage" }
);
