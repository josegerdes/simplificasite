import { Db, ObjectId } from "mongodb";

import { collections } from "@/server/db/collections";
import { SiteConfigDoc } from "@/server/db/schema";

const DEFAULT_CONFIG: Omit<SiteConfigDoc, "_id"> = {
  singleton: true,
  brandName: "Simplifica Doctor",
  logoUrl: "/logo.png",
  heroTitle: "Comece agora a formação que vai fazer a diferença na sua carreira",
  heroSubtitle:
    "Formamos profissionais odontológicos capacitados e atualizados, com cursos acessíveis e práticos que elevam o padrão da odontologia no Brasil.",
  pillars: [],
  testimonials: [],
  location: "Botafogo - Rua Oliveira Fausto, 35",
  whatsappNumber: null,
  pixel: {
    pixelId: null,
    testEventCode: null,
    enabled: false,
    events: { pageView: true, viewContent: true, initiateCheckout: true, purchase: true },
  },
  aiAgent: {
    enabled: false,
    model: "gpt-4o-mini",
    extraInstructions: "",
  },
  salesTools: {
    defaultSeatsLimit: 40,
    urgencyBannerEnabled: true,
    urgencyBannerText: "Vagas limitadas — garanta a sua matrícula agora",
  },
  updatedAt: new Date(),
};

/** Doc singleton — cria com defaults na primeira leitura se ainda não existir. */
export async function getOrCreateSiteConfig(db: Db): Promise<SiteConfigDoc> {
  const existing = await collections.siteConfig(db).findOne({ singleton: true });
  if (existing) return existing;

  const doc: SiteConfigDoc = { _id: new ObjectId(), ...DEFAULT_CONFIG };
  await collections.siteConfig(db).insertOne(doc);
  return doc;
}

export async function updateSiteConfig(db: Db, patch: Record<string, unknown>): Promise<SiteConfigDoc> {
  await getOrCreateSiteConfig(db);
  const updated = await collections
    .siteConfig(db)
    .findOneAndUpdate(
      { singleton: true },
      { $set: { ...patch, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
  if (!updated) throw new Error("Falha ao atualizar configuração do site");
  return updated;
}
