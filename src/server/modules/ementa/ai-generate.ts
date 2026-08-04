import OpenAI from "openai";

import { ApiError } from "@/server/auth/guards";
import { EmentaModule } from "@/server/db/schema";
import { stripMarkdown } from "@/server/lib/ai-text";

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
  /** Descrição longa (o texto de vendas completo da página do curso) — dá contexto real do
   *  que o curso promete, não só a frase curta do card. */
  longDescription: string;
  /** Destaques/diferenciais configurados no curso (ex: "prática em pacientes reais",
   *  "cirurgia guiada") — normalmente correspondem a conteúdo real que devia aparecer como
   *  módulo/tópico na ementa, não só marketing solto. */
  highlights: string[];
  /** Nomes dos professores/instrutores — contexto extra, ajuda a IA a não inventar um
   *  corpo docente genérico. */
  instructors: string[];
  workloadHours: number;
  modality: "PRESENCIAL" | "ONLINE";
  /** Texto de referência opcional (ex: conteúdo passado pelo professor, ementa antiga colada
   *  pelo admin) — se vier, a IA usa isso como fonte principal em vez de inventar do zero
   *  só a partir do nome/descrição do curso. */
  sourceText?: string;
  /** Módulos já existentes — se vierem junto com `sourceText`, a IA MELHORA a ementa atual
   *  usando o texto como base, em vez de descartar o que já tinha. */
  currentModules?: EmentaModule[];
  /** Lista de material opcional já existente (um item por linha) — mesma lógica de
   *  "melhorar em vez de descartar" dos módulos. */
  currentMaterials?: string[];
}

export interface GenerateEmentaResult {
  modules: EmentaModule[];
  materials: string[];
}

/**
 * Gera (ou melhora, se já existir conteúdo) um rascunho estruturado de ementa (módulos +
 * tópicos) com a OpenAI — o admin sempre revisa/edita e precisa clicar em "Salvar ementa"
 * antes de qualquer coisa ir pro banco; esta função NUNCA salva nada sozinha.
 */
export async function generateEmentaDraft(input: GenerateEmentaInput): Promise<GenerateEmentaResult> {
  const client = getClient();

  const hasCurrent = (input.currentModules?.length ?? 0) > 0;
  const hasCurrentMaterials = (input.currentMaterials?.length ?? 0) > 0;
  const hasSourceText = Boolean(input.sourceText?.trim());

  let instruction: string;
  if (hasSourceText && hasCurrent) {
    instruction =
      "Você vai MELHORAR a ementa atual do curso usando o texto de referência abaixo como base — incorpore o " +
      "conteúdo do texto, reorganize/complemente os módulos existentes, mas não jogue fora o que já fazia sentido.";
  } else if (hasSourceText) {
    instruction =
      "Você vai CRIAR a ementa do curso inteiramente a partir do texto de referência abaixo — estruture esse " +
      "conteúdo em módulos e tópicos organizados, sem inventar assuntos que não estejam implícitos no texto.";
  } else {
    instruction = "Gere uma ementa realista pra esse curso, com base no nome/descrição/carga horária informados.";
  }

  const userParts = [
    `Curso: ${input.courseName}`,
    `Modalidade: ${input.modality}`,
    `Carga horária: ${input.workloadHours}h`,
    `Descrição curta: ${input.shortDescription}`,
  ];
  if (input.longDescription.trim()) {
    userParts.push(`Descrição completa (texto de vendas da página do curso): ${input.longDescription.trim()}`);
  }
  if (input.highlights.length > 0) {
    userParts.push(
      `Destaques/diferenciais configurados no curso (considere refletir isso na ementa quando fizer sentido): ${input.highlights.join(", ")}`
    );
  }
  if (input.instructors.length > 0) {
    userParts.push(`Professores/instrutores do curso: ${input.instructors.join(", ")}`);
  }
  if (hasCurrent) {
    userParts.push(
      `Ementa atual:\n${input.currentModules!.map((m) => `- ${m.title}: ${m.topics.join("; ")}`).join("\n")}`
    );
  }
  if (hasCurrentMaterials) {
    userParts.push(`Lista de material atual:\n${input.currentMaterials!.map((item) => `- ${item}`).join("\n")}`);
  }
  if (hasSourceText) {
    userParts.push(`Texto de referência fornecido pelo admin:\n${input.sourceText!.trim()}`);
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Você é especialista em criar ementas de cursos de pós-graduação/especialização em odontologia " +
          `para a escola Simplifica Doctor, em português do Brasil. ${instruction} Além dos módulos, sugira ` +
          "também uma LISTA DE MATERIAL — os itens (kits, instrumentais, equipamentos, EPIs) que o aluno " +
          "precisa ter ou levar para acompanhar o curso na prática. Só inclua a lista de material se fizer " +
          "sentido pra esse curso (cursos totalmente teóricos/online podem não precisar de nenhum item — nesse " +
          "caso devolva um array vazio); se já existir uma lista de material atual ou um texto de referência " +
          "que mencione materiais, melhore/complete a partir disso em vez de inventar do zero. Nunca use " +
          'markdown (sem **negrito**, listas com "-"/"*" ou # títulos) em nenhum campo — só texto puro. ' +
          'Responda SOMENTE com um JSON no formato {"modules": [{"title": string, "topics": string[]}], ' +
          '"materials": string[]} — entre 4 e 8 módulos, cada um com 3 a 6 tópicos; "materials" é uma lista ' +
          "simples de strings, um item por linha, sem numeração.",
      },
      { role: "user", content: userParts.join("\n") },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  let parsed: { modules?: EmentaModule[]; materials?: string[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ApiError(502, "A IA retornou um conteúdo inválido — tente novamente");
  }

  const modules = parsed.modules ?? [];
  if (!modules.length) {
    throw new ApiError(502, "A IA não retornou módulos — tente novamente");
  }
  return {
    modules: modules.map((module) => ({
      title: stripMarkdown(String(module.title ?? "")),
      topics: (module.topics ?? []).map((topic) => stripMarkdown(String(topic))).filter(Boolean),
    })),
    materials: (parsed.materials ?? []).map((item) => stripMarkdown(String(item))).filter(Boolean),
  };
}
