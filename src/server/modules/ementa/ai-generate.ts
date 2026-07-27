import OpenAI from "openai";

import { ApiError } from "@/server/auth/guards";
import { EmentaModule } from "@/server/db/schema";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiError(422, "Configure a variável de ambiente OPENAI_API_KEY para usar a geração por IA");
  }
  return new OpenAI({ apiKey });
}

export interface GenerateEmentaInput {
  courseName: string;
  shortDescription: string;
  workloadHours: number;
  modality: "PRESENCIAL" | "ONLINE";
}

/**
 * Gera um rascunho estruturado de ementa (módulos + tópicos) com a OpenAI —
 * o admin sempre revisa/edita antes de publicar (`ementaPublished`), o texto
 * gerado nunca vai direto ao ar.
 */
export async function generateEmentaDraft(input: GenerateEmentaInput): Promise<EmentaModule[]> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Você é especialista em criar ementas de cursos de pós-graduação/especialização em odontologia " +
          "para a escola Simplifica Doctor. Gere uma ementa realista, organizada em módulos com tópicos " +
          "objetivos, em português do Brasil. Responda SOMENTE com um JSON no formato " +
          '{"modules": [{"title": string, "topics": string[]}]} — entre 4 e 8 módulos, cada um com 3 a 6 tópicos.',
      },
      {
        role: "user",
        content: `Curso: ${input.courseName}\nModalidade: ${input.modality}\nCarga horária: ${input.workloadHours}h\nDescrição: ${input.shortDescription}`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  let parsed: { modules?: EmentaModule[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ApiError(502, "A IA retornou um conteúdo inválido — tente novamente");
  }

  const modules = parsed.modules ?? [];
  if (!modules.length) {
    throw new ApiError(502, "A IA não retornou módulos — tente novamente");
  }
  return modules.map((module) => ({
    title: String(module.title ?? "").trim(),
    topics: (module.topics ?? []).map((topic) => String(topic).trim()).filter(Boolean),
  }));
}
