import { Db, ObjectId } from "mongodb";

import { collections } from "@/server/db/collections";
import { ContactMessageDoc, ContactMessageStatus } from "@/server/db/schema";

export function insertContactMessage(db: Db, message: ContactMessageDoc) {
  return collections.contactMessages(db).insertOne(message);
}

export function findAllContactMessages(db: Db) {
  return collections.contactMessages(db).find().sort({ createdAt: -1 }).toArray();
}

export function updateContactMessageStatus(db: Db, id: string, status: ContactMessageStatus) {
  return collections
    .contactMessages(db)
    .findOneAndUpdate(
      { _id: ObjectId.createFromHexString(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
}
