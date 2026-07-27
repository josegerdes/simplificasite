import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

import { connectDB } from "@/server/db/client";
import { collections } from "@/server/db/collections";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/server/auth/jwt";

export interface Session {
  userId: string;
  name: string;
  email: string;
  color: string;
  roleIds: string[];
  permissions: Set<string>;
  /** true se o usuário tem a role padrão "Administrador" (seedada) — gate de super admin. */
  isSuperAdmin: boolean;
  /** id do SellerDoc vinculado a este usuário, se houver — usado pra restringir a visão de
   *  matrículas de um vendedor comum às que foram atribuídas a ele. */
  sellerId: string | null;
}

/**
 * Resolve a sessão a partir do cookie a cada request, buscando roles no banco
 * (não confia em claims embutidos no JWT) — revogar/alterar uma role tem
 * efeito imediato, sem esperar o token expirar.
 */
export async function getSession(): Promise<Session | null> {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload) return null;

  const db = await connectDB();
  const user = await collections.users(db).findOne({
    _id: ObjectId.createFromHexString(payload.userId),
    active: true,
  });
  if (!user) return null;

  const roles = await collections
    .roles(db)
    .find({ _id: { $in: user.roleIds } })
    .toArray();

  const permissions = new Set<string>();
  let isSuperAdmin = false;
  for (const role of roles) {
    for (const permission of role.permissions) permissions.add(permission);
    if (role.isDefault) isSuperAdmin = true;
  }

  const seller = await collections.sellers(db).findOne({ userId: user._id });

  return {
    userId: user._id.toHexString(),
    name: user.name,
    email: user.email,
    color: user.color,
    roleIds: user.roleIds.map((id) => id.toHexString()),
    permissions,
    isSuperAdmin,
    sellerId: seller ? seller._id.toHexString() : null,
  };
}
