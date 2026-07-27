import { Db, ObjectId } from "mongodb";

import { collections } from "@/server/db/collections";
import { SellerDoc } from "@/server/db/schema";

export function findAllSellers(db: Db) {
  return collections.sellers(db).find().sort({ name: 1 }).toArray();
}

export function findSellerById(db: Db, id: string) {
  return collections.sellers(db).findOne({ _id: ObjectId.createFromHexString(id) });
}

export function findSellerByUserId(db: Db, userId: ObjectId) {
  return collections.sellers(db).findOne({ userId });
}

/** Pega o vendedor ativo há mais tempo sem receber uma matrícula — `lastAssignedAt: null`
 *  (nunca recebeu nenhuma) ordena primeiro por causa do sort ascendente com nulls first no Mongo. */
export function findNextSellerForRoundRobin(db: Db) {
  return collections.sellers(db).find({ active: true }).sort({ lastAssignedAt: 1 }).limit(1).next();
}

export function insertSeller(db: Db, seller: SellerDoc) {
  return collections.sellers(db).insertOne(seller);
}

export function updateSeller(db: Db, id: string, patch: Partial<SellerDoc>) {
  return collections
    .sellers(db)
    .findOneAndUpdate({ _id: ObjectId.createFromHexString(id) }, { $set: patch }, { returnDocument: "after" });
}

export function markAssigned(db: Db, id: ObjectId) {
  return collections.sellers(db).updateOne({ _id: id }, { $set: { lastAssignedAt: new Date() } });
}

export function deleteSeller(db: Db, id: string) {
  return collections.sellers(db).deleteOne({ _id: ObjectId.createFromHexString(id) });
}
