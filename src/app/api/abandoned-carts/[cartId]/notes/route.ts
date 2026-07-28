import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as abandonedCartsService from "@/server/modules/abandoned-carts/service";
import { addAbandonedCartNoteSchema } from "@/server/modules/abandoned-carts/types";

export const POST = withApiHandler<{ params: { cartId: string } }>(
  async (request, { params, session }) => {
    const body = await request.json();
    const input = addAbandonedCartNoteSchema.parse(body);
    const db = await connectDB();
    const cart = await abandonedCartsService.addAbandonedCartNote(db, session, params.cartId, input.note);
    return NextResponse.json(cart);
  },
  { permission: "sales.manage" }
);
