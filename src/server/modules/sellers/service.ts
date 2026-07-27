import { Db, ObjectId } from "mongodb";

import { SellerDoc } from "@/server/db/schema";
import { ApiError } from "@/server/auth/guards";
import { collections } from "@/server/db/collections";
import * as sellersRepo from "@/server/modules/sellers/repository";
import { CreateSellerInput, UpdateSellerInput } from "@/server/modules/sellers/types";

export function toPublicSeller(seller: SellerDoc) {
  return {
    id: seller._id.toHexString(),
    userId: seller.userId.toHexString(),
    name: seller.name,
    email: seller.email,
    phone: seller.phone,
    active: seller.active,
    createdAt: seller.createdAt,
  };
}

export async function listSellers(db: Db) {
  const sellers = await sellersRepo.findAllSellers(db);
  return sellers.map(toPublicSeller);
}

export async function createSeller(db: Db, input: CreateSellerInput) {
  const userId = ObjectId.createFromHexString(input.userId);
  const user = await collections.users(db).findOne({ _id: userId });
  if (!user) throw new ApiError(422, "Usuário não encontrado");

  const existing = await sellersRepo.findSellerByUserId(db, userId);
  if (existing) throw new ApiError(409, "Este usuário já é um vendedor");

  const seller: SellerDoc = {
    _id: new ObjectId(),
    userId,
    name: user.name,
    email: user.email,
    phone: input.phone,
    active: true,
    lastAssignedAt: null,
    createdAt: new Date(),
  };
  await sellersRepo.insertSeller(db, seller);
  return toPublicSeller(seller);
}

export async function updateSeller(db: Db, sellerId: string, input: UpdateSellerInput) {
  const updated = await sellersRepo.updateSeller(db, sellerId, input);
  if (!updated) throw new ApiError(404, "Vendedor não encontrado");
  return toPublicSeller(updated);
}

export async function deleteSeller(db: Db, sellerId: string) {
  await sellersRepo.deleteSeller(db, sellerId);
}

/** Round-robin: sempre atribui ao vendedor ativo há mais tempo sem receber uma matrícula.
 *  Retorna `null` (sem erro) se não houver nenhum vendedor ativo cadastrado ainda — a matrícula
 *  fica sem vendedor até alguém assumir manualmente pelo admin. */
export async function assignNextSeller(db: Db): Promise<ObjectId | null> {
  const seller = await sellersRepo.findNextSellerForRoundRobin(db);
  if (!seller) return null;
  await sellersRepo.markAssigned(db, seller._id);
  return seller._id;
}
