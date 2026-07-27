import { NextResponse } from "next/server";

import { getSession } from "@/server/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  return NextResponse.json({
    userId: session.userId,
    name: session.name,
    email: session.email,
    color: session.color,
    permissions: Array.from(session.permissions),
    isSuperAdmin: session.isSuperAdmin,
    sellerId: session.sellerId,
  });
}
