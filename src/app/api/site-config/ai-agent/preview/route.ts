import { NextResponse } from "next/server";

import { connectDB } from "@/server/db/client";
import { withApiHandler } from "@/server/http/with-api-handler";
import { buildSystemPrompt } from "@/server/modules/ai-agent/context-builder";

/** Mostra pro admin exatamente o prompt de sistema que o vendedor IA recebe agora — montado
 *  ao vivo a partir do banco (cursos publicados, preços, vagas, ementa), igual roda numa
 *  conversa de verdade. Transparência: sem isso não dá pra saber o que a IA "enxerga". */
export const GET = withApiHandler(
  async (request) => {
    const personaId = request.nextUrl.searchParams.get("personaId");
    const db = await connectDB();
    const prompt = await buildSystemPrompt(db, personaId);
    return NextResponse.json({ prompt });
  },
  { permission: "site-config.manage" }
);
