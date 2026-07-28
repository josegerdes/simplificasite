import { Db, ObjectId } from "mongodb";

import { ContactMessageDoc } from "@/server/db/schema";
import { ApiError } from "@/server/auth/guards";
import * as contactRepo from "@/server/modules/contact/repository";
import { CreateContactMessageInput, UpdateContactMessageInput } from "@/server/modules/contact/types";

function toAdminMessage(message: ContactMessageDoc) {
  return {
    id: message._id.toHexString(),
    category: message.category,
    name: message.name,
    email: message.email,
    phone: message.phone,
    message: message.message,
    status: message.status,
    createdAt: message.createdAt,
  };
}

export async function submitContactMessage(db: Db, input: CreateContactMessageInput) {
  const now = new Date();
  const message: ContactMessageDoc = {
    _id: new ObjectId(),
    category: input.category,
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    message: input.message,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  await contactRepo.insertContactMessage(db, message);
  return { id: message._id.toHexString() };
}

export async function listContactMessages(db: Db) {
  const messages = await contactRepo.findAllContactMessages(db);
  return messages.map(toAdminMessage);
}

export async function updateContactMessageStatus(db: Db, id: string, input: UpdateContactMessageInput) {
  const updated = await contactRepo.updateContactMessageStatus(db, id, input.status);
  if (!updated) throw new ApiError(404, "Mensagem não encontrada");
  return toAdminMessage(updated);
}
