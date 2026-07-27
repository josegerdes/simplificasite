import { Db } from "mongodb";
import OpenAI from "openai";

import { ApiError } from "@/server/auth/guards";
import { collections } from "@/server/db/collections";
import { buildSystemPrompt, getAiModel, isAiAgentEnabled } from "@/server/modules/ai-agent/context-builder";
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
  const [systemPrompt, model] = await Promise.all([buildSystemPrompt(db), getAiModel(db)]);

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
        await persistConversation(db, input.sessionId, lastUserMessage?.content ?? "", assistantReply);
      }
    },
  });

  return stream;
}

async function persistConversation(db: Db, sessionId: string, userContent: string, assistantContent: string) {
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
      $setOnInsert: { courseId: null, leadName: null, leadContact: null, createdAt: now },
      $set: { updatedAt: now },
    },
    { upsert: true }
  );
}
