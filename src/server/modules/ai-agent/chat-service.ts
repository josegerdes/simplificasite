import { Db } from "mongodb";
import OpenAI from "openai";

import { ApiError } from "@/server/auth/guards";
import { collections } from "@/server/db/collections";
import { buildSystemPrompt, getAiModel, isAiAgentEnabled, resolvePersona } from "@/server/modules/ai-agent/context-builder";
import { getOrCreateSiteConfig } from "@/server/modules/site-config/repository";
import { ChatRequestInput } from "@/server/modules/ai-agent/types";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiError(422, "O vendedor IA ainda não foi configurado — tente novamente mais tarde ou fale com nosso time.");
  }
  return new OpenAI({ apiKey });
}

/** Guarda a conversa (pra o admin revisar qualidade do lead depois) e devolve um
 *  stream de texto puro da resposta — o cliente lê via `response.body` direto,
 *  sem formatação SSE (mais simples de consumir no widget). */
export async function streamChatReply(db: Db, input: ChatRequestInput): Promise<ReadableStream<Uint8Array>> {
  if (!(await isAiAgentEnabled(db))) {
    throw new ApiError(422, "O vendedor IA está desativado no momento.");
  }

  const client = getClient();
  const [systemPrompt, model, config] = await Promise.all([
    buildSystemPrompt(db, input.personaId),
    getAiModel(db),
    getOrCreateSiteConfig(db),
  ]);
  const persona = resolvePersona(config.aiAgent.personas, input.personaId);

  const lastUserMessage = [...input.messages].reverse().find((m) => m.role === "user");

  const completionStream = await client.chat.completions.create({
    model,
    stream: true,
    messages: [{ role: "system", content: systemPrompt }, ...input.messages],
  });

  let assistantReply = "";
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completionStream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            assistantReply += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
      } catch (error) {
        console.error("[ai-agent] erro no stream:", error);
      } finally {
        controller.close();
        await persistConversation(db, input.sessionId, persona.id, persona.name, lastUserMessage?.content ?? "", assistantReply);
      }
    },
  });

  return stream;
}

async function persistConversation(
  db: Db,
  sessionId: string,
  personaId: string,
  personaName: string,
  userContent: string,
  assistantContent: string
) {
  const now = new Date();
  await collections.aiConversations(db).updateOne(
    { sessionId },
    {
      $push: {
        messages: {
          $each: [
            { role: "user", content: userContent, createdAt: now },
            { role: "assistant", content: assistantContent, createdAt: now },
          ],
        },
      },
      $setOnInsert: {
        courseId: null,
        leadName: null,
        leadContact: null,
        converted: false,
        convertedAt: null,
        convertedCourseSlug: null,
        createdAt: now,
      },
      $set: { updatedAt: now, personaId, personaName },
    },
    { upsert: true }
  );
}

/** Marca a conversa como "convertida" quando o visitante clica num link de curso que a IA
 *  mandou no chat — sinal forte de intenção, mostrado pro admin na lista de conversas.
 *  Não falha se a conversa ainda não existir (ex: clique muito rápido antes do primeiro
 *  turno terminar de persistir) — só não marca nada nesse caso raro. */
export async function markConversationConverted(db: Db, sessionId: string, courseSlug: string): Promise<void> {
  await collections.aiConversations(db).updateOne(
    { sessionId },
    { $set: { converted: true, convertedAt: new Date(), convertedCourseSlug: courseSlug } }
  );
}
