import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as abandonedCartsService from "@/server/modules/abandoned-carts/service";

export const GET = withApiHandler(
  async () => {
    const db = await connectDB();
    const carts = await abandonedCartsService.listAbandonedCarts(db);
    return NextResponse.json(carts);
  },
  { permission: "sales.view" }
);
