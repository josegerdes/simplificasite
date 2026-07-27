import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as siteConfigService from "@/server/modules/site-config/service";
import { updateSiteConfigSchema } from "@/server/modules/site-config/types";

export const GET = withApiHandler(
  async () => {
    const db = await connectDB();
    const config = await siteConfigService.getAdminSiteConfig(db);
    return NextResponse.json(config);
  },
  { permission: "site-config.manage" }
);

export const PATCH = withApiHandler(
  async (request) => {
    const body = await request.json();
    const input = updateSiteConfigSchema.parse(body);
    const db = await connectDB();
    const config = await siteConfigService.updateSiteConfig(db, input);
    return NextResponse.json(config);
  },
  { permission: "site-config.manage" }
);
