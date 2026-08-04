import { Db, ObjectId } from "mongodb";

import { collections } from "@/server/db/collections";
import { EmentaModule } from "@/server/db/schema";

export function findEmentaByCourseId(db: Db, courseId: ObjectId) {
  return collections.ementas(db).findOne({ courseId });
}

export function findEmentasByCourseIds(db: Db, courseIds: ObjectId[]) {
  return collections.ementas(db).find({ courseId: { $in: courseIds } }).toArray();
}

export async function upsertEmenta(
  db: Db,
  courseId: ObjectId,
  modules: EmentaModule[],
  generatedByAi: boolean,
  materials: string[] = []
) {
  await collections
    .ementas(db)
    .updateOne(
      { courseId },
      { $set: { modules, materials, generatedByAi, updatedAt: new Date() }, $setOnInsert: { _id: new ObjectId(), courseId } },
      { upsert: true }
    );
  return collections.ementas(db).findOne({ courseId });
}
