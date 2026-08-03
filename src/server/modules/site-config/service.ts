import { Db } from "mongodb";

import { SiteConfigDoc } from "@/server/db/schema";
import * as repo from "@/server/modules/site-config/repository";
import { UpdateSiteConfigInput } from "@/server/modules/site-config/types";

export function toAdminSiteConfig(config: SiteConfigDoc) {
  return {
    brandName: config.brandName,
    logoUrl: config.logoUrl,
    heroImageUrl: config.heroImageUrl,
    heroTitle: config.heroTitle,
    heroSubtitle: config.heroSubtitle,
    pillars: config.pillars,
    testimonials: config.testimonials,
    locations: config.locations,
    socialLinks: config.socialLinks,
    whatsappNumber: config.whatsappNumber,
    pixel: config.pixel,
    aiAgent: config.aiAgent,
    salesTools: config.salesTools,
  };
}

/** Versão exposta ao site público — nunca inclui segredos (o token de
 *  Conversions API do Facebook não existe neste doc; fica só em env var). */
export function toPublicSiteConfig(config: SiteConfigDoc) {
  return {
    brandName: config.brandName,
    logoUrl: config.logoUrl,
    heroImageUrl: config.heroImageUrl,
    heroTitle: config.heroTitle,
    heroSubtitle: config.heroSubtitle,
    pillars: config.pillars,
    testimonials: config.testimonials,
    locations: config.locations,
    socialLinks: config.socialLinks,
    whatsappNumber: config.whatsappNumber,
    pixel: config.pixel.enabled
      ? { pixelId: config.pixel.pixelId, testEventCode: config.pixel.testEventCode, events: config.pixel.events }
      : null,
    aiAgentEnabled: config.aiAgent.enabled,
    // Só nome/id — instruções de cada persona são detalhe interno do prompt, nunca vão pro client.
    aiAgentPersonas: config.aiAgent.personas.map((p) => ({ id: p.id, name: p.name })),
    salesTools: config.salesTools,
  };
}

export async function getAdminSiteConfig(db: Db) {
  const config = await repo.getOrCreateSiteConfig(db);
  return toAdminSiteConfig(config);
}

export async function getPublicSiteConfig(db: Db) {
  const config = await repo.getOrCreateSiteConfig(db);
  return toPublicSiteConfig(config);
}

export async function updateSiteConfig(db: Db, input: UpdateSiteConfigInput) {
  const current = await repo.getOrCreateSiteConfig(db);
  const patch: Record<string, unknown> = { ...input };
  if (input.pixel) patch.pixel = { ...current.pixel, ...input.pixel };
  if (input.aiAgent) patch.aiAgent = { ...current.aiAgent, ...input.aiAgent };
  if (input.salesTools) patch.salesTools = { ...current.salesTools, ...input.salesTools };
  const updated = await repo.updateSiteConfig(db, patch);
  return toAdminSiteConfig(updated);
}
