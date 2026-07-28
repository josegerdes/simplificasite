import { ObjectId, Db } from "mongodb";

import { collections } from "@/server/db/collections";
import { hashPassword } from "@/server/auth/password";
import { ALL_PERMISSIONS } from "@/server/rbac/permissions";

/**
 * Cria a role Administrador + o usuário administrador inicial se ainda não
 * existir nenhum usuário. Idempotente — chamada automaticamente no boot via
 * `instrumentation.ts`, já que a imagem Docker (`output: "standalone"`) não
 * inclui `tsx`/arquivos fonte pra rodar `npm run seed` manualmente dentro
 * do container publicado.
 */
export async function seedInitialAdmin(db: Db): Promise<void> {
  const userCount = await collections.users(db).countDocuments();
  if (userCount > 0) {
    console.log("[seed] Ignorado: já existem usuários.");
    return;
  }

  const now = new Date();
  const adminRole = {
    _id: new ObjectId(),
    name: "Administrador",
    color: "#1F8F86",
    position: 1,
    permissions: ALL_PERMISSIONS,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  };
  await collections.roles(db).insertOne(adminRole);

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@simplificadoctor.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";

  await collections.users(db).insertOne({
    _id: new ObjectId(),
    name: "Administrador",
    email: email.toLowerCase(),
    passwordHash: await hashPassword(password),
    roleIds: [adminRole._id],
    color: "#1F8F86",
    active: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`[seed] Usuário administrador criado: ${email} / ${password}`);
  console.log("[seed] Troque a senha assim que possível.");
}

/**
 * `seedInitialAdmin` só roda uma vez (idempotente por "já existe usuário") — então toda
 * permissão nova adicionada ao catálogo DEPOIS do primeiro boot nunca chegava sozinha na
 * role Administrador já existente no banco (ela guarda uma cópia da lista, não uma
 * referência). Roda em TODO boot, `$addToSet` (nunca remove nada, só garante que a role
 * padrão sempre tem todas as permissões que o código atual conhece).
 */
export async function syncDefaultRolePermissions(db: Db): Promise<void> {
  await collections
    .roles(db)
    .updateMany({ isDefault: true }, { $addToSet: { permissions: { $each: ALL_PERMISSIONS } } });
}
