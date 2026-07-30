import { NextResponse } from "next/server";

import { withPublicApiHandler } from "@/server/http/with-api-handler";
import { externalLeadSchema } from "@/server/modules/external-leads/types";
import { submitExternalLead } from "@/server/modules/external-leads/service";

export const dynamic = "force-dynamic";

export const POST = withPublicApiHandler(async (request) => {
  const body = await request.json();
  const input = externalLeadSchema.parse(body);
  await submitExternalLead(input, { leadType: "patient", originLabel: "Simplifica Doctor - Site (Paciente Modelo)" });
  return NextResponse.json({ ok: true }, { status: 201 });
});
