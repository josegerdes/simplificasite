import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import * as siteConfigService from "@/server/modules/site-config/service";

// Sem nenhuma API dinâmica (cookies/searchParams), o Next tentaria pré-renderizar essa
// rota em build time — quando DATABASE_URL não existe de propósito (ver nota em
// `(public)/layout.tsx`). Força sempre dynamic.
export const dynamic = "force-dynamic";

export const GET = withPublicApiHandler(async () => {
  const db = await connectDB();
  const config = await siteConfigService.getPublicSiteConfig(db);
  return NextResponse.json(config);
});
