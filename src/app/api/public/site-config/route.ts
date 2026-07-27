import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withPublicApiHandler } from "@/server/http/with-api-handler";
import * as siteConfigService from "@/server/modules/site-config/service";

export const GET = withPublicApiHandler(async () => {
  const db = await connectDB();
  const config = await siteConfigService.getPublicSiteConfig(db);
  return NextResponse.json(config);
});
