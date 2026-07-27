import { Db, ObjectId } from "mongodb";

import { collections } from "@/server/db/collections";
import { EmentaModule } from "@/server/db/schema";

export function findEmentaByCourseId(db: Db, courseId: ObjectId) {
  return collections.ementas(db).findOne({ courseId });
}

export async function upsertEmenta(
  db: Db,
  courseId: ObjectId,
  modules: EmentaModule[],
  generatedByAi: boolean
) {
  await collections
    .ementas(db)
    .updateOne(
      { courseId },
      { $set: { modules, generatedByAi, updatedAt: new Date() }, $setOnInsert: { _id: new ObjectId(), courseId } },
      { upsert: true }
    );
  return collections.ementas(db).findOne({ courseId });
}
