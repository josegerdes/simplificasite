import { Db, ObjectId } from "mongodb";

import { collections } from "@/server/db/collections";
import { ContactNote, ContactStatus, EnrollmentDoc, PaymentStatus } from "@/server/db/schema";

export function insertEnrollment(db: Db, enrollment: EnrollmentDoc) {
  return collections.enrollments(db).insertOne(enrollment);
}

export function findEnrollmentById(db: Db, id: string) {
  return collections.enrollments(db).findOne({ _id: ObjectId.createFromHexString(id) });
}

export function findEnrollmentByMpPaymentId(db: Db, mpPaymentId: string) {
  return collections.enrollments(db).findOne({ mpPaymentId });
}

export function findAllEnrollments(db: Db, filter: { sellerId?: string | null; courseId?: string; status?: string } = {}) {
  const query: Record<string, unknown> = {};
  if (filter.sellerId !== undefined) {
    query.sellerId = filter.sellerId === null ? null : ObjectId.createFromHexString(filter.sellerId);
  }
  if (filter.courseId) query.courseId = ObjectId.createFromHexString(filter.courseId);
  if (filter.status) query.contactStatus = filter.status;
  return collections.enrollments(db).find(query).sort({ createdAt: -1 }).toArray();
}

export function updatePaymentStatus(
  db: Db,
  id: ObjectId,
  patch: { paymentStatus: PaymentStatus; mpPaymentId: string | null; conversionsApiSent?: boolean }
) {
  return collections
    .enrollments(db)
    .findOneAndUpdate({ _id: id }, { $set: { ...patch, updatedAt: new Date() } }, { returnDocument: "after" });
}

export function updateContactStatus(db: Db, id: string, contactStatus: ContactStatus) {
  return collections
    .enrollments(db)
    .findOneAndUpdate(
      { _id: ObjectId.createFromHexString(id) },
      { $set: { contactStatus, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
}

export function assignSeller(db: Db, id: string, sellerId: string | null) {
  return collections
    .enrollments(db)
    .findOneAndUpdate(
      { _id: ObjectId.createFromHexString(id) },
      { $set: { sellerId: sellerId ? ObjectId.createFromHexString(sellerId) : null, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
}

export function addNote(db: Db, id: string, note: ContactNote) {
  return collections
    .enrollments(db)
    .findOneAndUpdate(
      { _id: ObjectId.createFromHexString(id) },
      { $push: { notes: note }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );
}

export function countApprovedByCourse(db: Db, courseId: ObjectId) {
  return collections.enrollments(db).countDocuments({ courseId, paymentStatus: "approved" });
}
