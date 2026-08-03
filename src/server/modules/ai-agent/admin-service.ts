import { Db, ObjectId } from "mongodb";

import { AiConversationDoc } from "@/server/db/schema";
import { ApiError } from "@/server/auth/guards";
import { collections } from "@/server/db/collections";

function toPublicConversation(conversation: AiConversationDoc) {
  return {
    id: conversation._id.toHexString(),
    sessionId: conversation.sessionId,
    personaName: conversation.personaName,
    messages: conversation.messages,
    converted: conversation.converted,
    convertedCourseSlug: conversation.convertedCourseSlug,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export async function listConversations(db: Db) {
  const conversations = await collections
    .aiConversations(db)
    .find()
    .sort({ updatedAt: -1 })
    .limit(200)
    .toArray();
  return conversations.map((conversation) => ({
    id: conversation._id.toHexString(),
    sessionId: conversation.sessionId,
    personaName: conversation.personaName,
    messageCount: conversation.messages.length,
    firstMessage: conversation.messages[0]?.content ?? "",
    converted: conversation.converted,
    convertedCourseSlug: conversation.convertedCourseSlug,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  }));
}

export async function getConversation(db: Db, id: string) {
  const conversation = await collections.aiConversations(db).findOne({ _id: ObjectId.createFromHexString(id) });
  if (!conversation) throw new ApiError(404, "Conversa não encontrada");
  return toPublicConversation(conversation);
}
