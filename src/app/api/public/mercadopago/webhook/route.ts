import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import * as checkoutService from "@/server/modules/enrollments/checkout-service";

/**
 * Mercado Pago manda `{type: "payment", data: {id}}` (formato novo) ou
 * `?topic=payment&id=...` via query string (formato legado) — trata os dois.
 * Sempre responde 200 rápido (mesmo em erro) pra evitar retentativas excessivas
 * do lado do Mercado Pago; erros ficam só no log do servidor.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const paymentId =
      body?.data?.id?.toString() ?? request.nextUrl.searchParams.get("id") ?? request.nextUrl.searchParams.get("data.id");
    const type = body?.type ?? request.nextUrl.searchParams.get("topic");

    if (type === "payment" && paymentId) {
      const db = await connectDB();
      await checkoutService.handleMercadoPagoWebhook(db, paymentId);
    }
  } catch (error) {
    console.error("[mercadopago webhook] erro ao processar:", error);
  }
  return NextResponse.json({ received: true });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
