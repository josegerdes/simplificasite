import { Db, ObjectId } from "mongodb";

import { collections } from "@/server/db/collections";
import { CourseDoc, CourseModality } from "@/server/db/schema";

export function findAllCourses(db: Db) {
  return collections.courses(db).find().sort({ createdAt: -1 }).toArray();
}

export function findCourseById(db: Db, id: string) {
  return collections.courses(db).findOne({ _id: ObjectId.createFromHexString(id) });
}

export function findCourseBySlug(db: Db, slug: string) {
  return collections.courses(db).findOne({ slug });
}

export function findPublishedCourses(db: Db, modality?: CourseModality) {
  return collections
    .courses(db)
    .find({ status: { $in: ["PUBLISHED", "SOLD_OUT"] }, ...(modality ? { modality } : {}) })
    .sort({ createdAt: -1 })
    .toArray();
}

/** Turmas já realizadas — mostradas no site como prova social (sem CTA de compra). */
export function findClosedCourses(db: Db) {
  return collections.courses(db).find({ status: "CLOSED" }).sort({ updatedAt: -1 }).limit(12).toArray();
}

export function insertCourse(db: Db, course: CourseDoc) {
  return collections.courses(db).insertOne(course);
}

export function updateCourse(db: Db, id: string, patch: Partial<CourseDoc>) {
  return collections
    .courses(db)
    .findOneAndUpdate(
      { _id: ObjectId.createFromHexString(id) },
      { $set: { ...patch, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
}

export function incrementSeatsSold(db: Db, id: ObjectId) {
  return collections.courses(db).findOneAndUpdate(
    { _id: id },
    { $inc: { seatsSold: 1 }, $set: { updatedAt: new Date() } },
    { returnDocument: "after" }
  );
}

export function deleteCourse(db: Db, id: string) {
  return collections.courses(db).deleteOne({ _id: ObjectId.createFromHexString(id) });
}

export function countEnrollmentsForCourse(db: Db, courseId: string) {
  return collections.enrollments(db).countDocuments({ courseId: ObjectId.createFromHexString(courseId) });
}
