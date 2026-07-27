import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import * as dashboardService from "@/server/modules/dashboard/service";

export const GET = withApiHandler(
  async () => {
    const db = await connectDB();
    const stats = await dashboardService.getDashboardStats(db);
    return NextResponse.json(stats);
  },
  { permission: "dashboard.view" }
);
