import { z } from "zod";

const pixelSchema = z.object({
  pixelId: z.string().nullable(),
  testEventCode: z.string().nullable(),
  enabled: z.boolean(),
  events: z.object({
    pageView: z.boolean(),
    viewContent: z.boolean(),
    initiateCheckout: z.boolean(),
    purchase: z.boolean(),
  }),
});

const personaSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  extraInstructions: z.string().max(4000),
});

const aiAgentSchema = z.object({
  enabled: z.boolean(),
  model: z.string().min(1),
  extraInstructions: z.string(),
  personas: z.array(personaSchema).max(20),
});

const salesToolsSchema = z.object({
  defaultSeatsLimit: z.coerce.number().int().positive().nullable(),
  urgencyBannerEnabled: z.boolean(),
  urgencyBannerText: z.string(),
});

const testimonialSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  role: z.string(),
  quote: z.string().min(1),
});

const locationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  address: z.string().min(1),
  imageUrl: z.string().nullable().default(null),
});

const socialLinksSchema = z.object({
  instagram: z.string().nullable(),
  facebook: z.string().nullable(),
  tiktok: z.string().nullable(),
  youtube: z.string().nullable(),
});

export const updateSiteConfigSchema = z.object({
  brandName: z.string().min(1).optional(),
  logoUrl: z.string().min(1).optional(),
  heroImageUrl: z.string().min(1).optional(),
  heroTitle: z.string().min(1).optional(),
  heroSubtitle: z.string().min(1).optional(),
  pillars: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).optional(),
  testimonials: z.array(testimonialSchema).optional(),
  locations: z.array(locationSchema).optional(),
  socialLinks: socialLinksSchema.partial().optional(),
  whatsappNumber: z.string().nullable().optional(),
  pixel: pixelSchema.partial().optional(),
  aiAgent: aiAgentSchema.partial().optional(),
  salesTools: salesToolsSchema.partial().optional(),
});
export type UpdateSiteConfigInput = z.infer<typeof updateSiteConfigSchema>;
