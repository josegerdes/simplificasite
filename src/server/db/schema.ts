import { ObjectId } from "mongodb";

/**
 * Definições de documento por coleção Mongo. Banco schemaless (driver nativo,
 * sem ORM) — estes tipos existem só no lado da aplicação.
 */

export interface UserDoc {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  roleIds: ObjectId[];
  color: string;
  active: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDoc {
  _id: ObjectId;
  name: string;
  color: string;
  position: number;
  permissions: string[];
  /** true só na role seedada "Administrador" — gate de super admin, não é permissão togável. */
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseModality = "PRESENCIAL" | "ONLINE";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "SOLD_OUT" | "CLOSED";

export interface CoursePixelOverride {
  enabled: boolean;
  pixelId: string | null;
}

export interface CourseDoc {
  _id: ObjectId;
  slug: string;
  name: string;
  modality: CourseModality;
  status: CourseStatus;
  shortDescription: string;
  longDescription: string;
  highlights: string[];
  instructors: string[];
  coverImageUrl: string | null;
  workloadHours: number;
  location: string | null;
  startDate: string | null;
  /** Preço da matrícula (o aluno presencial paga só isso — o restante do curso é fora deste sistema). */
  price: number;
  /** Preço "de/por" opcional — se preenchido, mostra tachado no site como gatilho de urgência. */
  originalPrice: number | null;
  /** Prazo do preço promocional/contador de urgência na página do curso. */
  promoDeadline: Date | null;
  seatsLimit: number | null;
  seatsSold: number;
  pixelOverride: CoursePixelOverride;
  ementaPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmentaModule {
  title: string;
  topics: string[];
}

export interface EmentaDoc {
  _id: ObjectId;
  courseId: ObjectId;
  modules: EmentaModule[];
  /** Rascunho gerado por IA ainda não revisado/publicado pelo admin. */
  generatedByAi: boolean;
  updatedAt: Date;
}

export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded" | "cancelled";
export type ContactStatus = "not_contacted" | "contacted" | "converted" | "lost";

export interface ContactNote {
  authorId: ObjectId;
  authorName: string;
  note: string;
  createdAt: Date;
}

export interface EnrollmentDoc {
  _id: ObjectId;
  courseId: ObjectId;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentCpf: string;
  amount: number;
  paymentProvider: "mercadopago";
  paymentStatus: PaymentStatus;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  sellerId: ObjectId | null;
  contactStatus: ContactStatus;
  notes: ContactNote[];
  utm: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    content: string | null;
    term: string | null;
  };
  /** event_id usado no Pixel client + Conversions API — dedup do mesmo evento de compra nos dois canais. */
  purchaseEventId: string;
  conversionsApiSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerDoc {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  createdAt: Date;
}

export interface SiteConfigPixelSettings {
  pixelId: string | null;
  testEventCode: string | null;
  enabled: boolean;
  events: {
    pageView: boolean;
    viewContent: boolean;
    initiateCheckout: boolean;
    purchase: boolean;
  };
}

export interface SiteConfigAiAgentSettings {
  enabled: boolean;
  model: string;
  extraInstructions: string;
}

export interface SiteConfigSalesToolsDefaults {
  defaultSeatsLimit: number | null;
  urgencyBannerEnabled: boolean;
  urgencyBannerText: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export interface SiteConfigDoc {
  _id: ObjectId;
  singleton: true;
  brandName: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  pillars: { title: string; description: string }[];
  testimonials: Testimonial[];
  location: string;
  whatsappNumber: string | null;
  pixel: SiteConfigPixelSettings;
  aiAgent: SiteConfigAiAgentSettings;
  salesTools: SiteConfigSalesToolsDefaults;
  updatedAt: Date;
}

export interface AiConversationMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface AiConversationDoc {
  _id: ObjectId;
  sessionId: string;
  courseId: ObjectId | null;
  messages: AiConversationMessage[];
  leadName: string | null;
  leadContact: string | null;
  createdAt: Date;
  updatedAt: Date;
}
