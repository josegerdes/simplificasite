import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as abandonedCartsService from "@/server/modules/abandoned-carts/service";
import { updateAbandonedCartSchema } from "@/server/modules/abandoned-carts/types";

export const PATCH = withApiHandler<{ params: { cartId: string } }>(
  async (request, { params }) => {
    const body = await request.json();
    const input = updateAbandonedCartSchema.parse(body);
    const db = await connectDB();
    const cart = await abandonedCartsService.updateAbandonedCartStatus(db, params.cartId, input.status);
    return NextResponse.json(cart);
  },
  { permission: "sales.manage" }
);
