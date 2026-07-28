import { Db, ObjectId } from "mongodb";

import { collections } from "@/server/db/collections";
import { AbandonedCartDoc, ContactNote } from "@/server/db/schema";

export function upsertBySessionAndCourse(
  db: Db,
  sessionId: string,
  courseId: ObjectId,
  patch: Pick<AbandonedCartDoc, "courseName" | "courseSlug" | "step" | "studentName" | "studentEmail" | "studentPhone" | "studentCpf" | "utm">
) {
  const now = new Date();
  return collections.abandonedCarts(db).findOneAndUpdate(
    { sessionId, courseId, status: { $ne: "converted" } },
    {
      $set: { ...patch, updatedAt: now, lastActivityAt: now },
      $setOnInsert: {
        _id: new ObjectId(),
        sessionId,
        courseId,
        status: "open",
        notes: [],
        convertedEnrollmentId: null,
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );
}

export function markConverted(db: Db, sessionId: string, courseId: ObjectId, enrollmentId: ObjectId) {
  return collections.abandonedCarts(db).updateMany(
    { sessionId, courseId, status: { $ne: "converted" } },
    { $set: { status: "converted", convertedEnrollmentId: enrollmentId, updatedAt: new Date() } }
  );
}

export function findAll(db: Db) {
  return collections.abandonedCarts(db).find({}).sort({ lastActivityAt: -1 }).toArray();
}

export function findById(db: Db, id: string) {
  return collections.abandonedCarts(db).findOne({ _id: ObjectId.createFromHexString(id) });
}

export function updateStatus(db: Db, id: string, status: AbandonedCartDoc["status"]) {
  return collections
    .abandonedCarts(db)
    .findOneAndUpdate(
      { _id: ObjectId.createFromHexString(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
}

export function addNote(db: Db, id: string, note: ContactNote) {
  return collections
    .abandonedCarts(db)
    .findOneAndUpdate(
      { _id: ObjectId.createFromHexString(id) },
      { $push: { notes: note }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );
}
