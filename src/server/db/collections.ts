import { Db } from "mongodb";
import type {
  AiConversationDoc,
  ContactMessageDoc,
  CourseDoc,
  EmentaDoc,
  EnrollmentDoc,
  RoleDoc,
  SellerDoc,
  SiteConfigDoc,
  UserDoc,
} from "@/server/db/schema";

/**
 * Getters tipados por coleção — evita `db.collection("nomeCru")` espalhado
 * pelas rotas/serviços.
 */
export const collections = {
  users: (db: Db) => db.collection<UserDoc>("users"),
  roles: (db: Db) => db.collection<RoleDoc>("roles"),
  courses: (db: Db) => db.collection<CourseDoc>("courses"),
  ementas: (db: Db) => db.collection<EmentaDoc>("ementas"),
  enrollments: (db: Db) => db.collection<EnrollmentDoc>("enrollments"),
  sellers: (db: Db) => db.collection<SellerDoc>("sellers"),
  siteConfig: (db: Db) => db.collection<SiteConfigDoc>("siteConfig"),
  aiConversations: (db: Db) => db.collection<AiConversationDoc>("aiConversations"),
  contactMessages: (db: Db) => db.collection<ContactMessageDoc>("contactMessages"),
};
