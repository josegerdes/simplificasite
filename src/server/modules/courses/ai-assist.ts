import OpenAI from "openai";

import { ApiError } from "@/server/auth/guards";
import { CourseModality } from "@/server/db/schema";
import { stripMarkdown } from "@/server/lib/ai-text";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiError(422, "Configure a variável de ambiente OPENAI_API_KEY para usar a geração por IA");
  }
  return new OpenAI({ apiKey });
}

export type AssistField = "shortDescription" | "longDescription" | "highlights";

export interface AiAssistInput {
  field: AssistField;
  courseName: string;
  modality: CourseModality;
  workloadHours: number;
  currentValue: string;
}

const FIELD_PROMPTS: Record<AssistField, string> = {
  shortDescription:
    "Escreva UMA frase curta e vendedora (máximo 20 palavras) para aparecer nos cards de curso do site, em português do Brasil. Direto ao ponto, sem clichês genéricos.",
  longDescription:
    "Escreva uma descrição completa do curso (2-3 parágrafos curtos, português do Brasil) para a página de vendas — destaque diferenciais práticos, prática em pacientes reais quando fizer sentido, e tom que gere confiança e urgência de garantir a vaga.",
  highlights:
    'Gere de 3 a 5 destaques curtos (bullet points, cada um com no máximo 6 palavras) pra usar como lista de diferenciais do curso. Responda SOMENTE com um JSON no formato {"highlights": string[]}.',
};

/** Gera ou reescreve UM campo específico do curso — o admin sempre revisa antes de salvar
 *  (o botão só preenche o campo no formulário, não salva sozinho). */
export async function generateCourseField(input: AiAssistInput): Promise<string | string[]> {
  const client = getClient();

  const userContext = `Curso: ${input.courseName}\nModalidade: ${input.modality}\nCarga horária: ${input.workloadHours}h${
    input.currentValue ? `\nTexto atual (melhore/reescreva em vez de ignorar): ${input.currentValue}` : ""
  }`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    ...(input.field === "highlights" ? { response_format: { type: "json_object" as const } } : {}),
    messages: [
      {
        role: "system",
        content: `Você ajuda a escola Simplifica Doctor a escrever textos de vendas pra cursos de pós-graduação em odontologia. Nunca use markdown (sem **negrito**, *itálico*, listas com "-"/"*" ou # títulos) — só texto puro, é pra ir direto num campo de formulário. ${FIELD_PROMPTS[input.field]}`,
      },
      { role: "user", content: userContext },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";

  if (input.field === "highlights") {
    try {
      const parsed = JSON.parse(raw) as { highlights?: string[] };
      const highlights = (parsed.highlights ?? []).map((h) => stripMarkdown(String(h))).filter(Boolean);
      if (!highlights.length) throw new Error("vazio");
      return highlights;
    } catch {
      throw new ApiError(502, "A IA retornou um conteúdo inválido — tente novamente");
    }
  }

  const text = stripMarkdown(raw);
  if (!text) throw new ApiError(502, "A IA não retornou texto — tente novamente");
  return text;
}
