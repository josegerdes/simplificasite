export type CourseModality = "PRESENCIAL" | "ONLINE";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "SOLD_OUT" | "CLOSED";
export type CourseSaleMode = "checkout" | "lead";

export interface CourseAdmin {
  id: string;
  slug: string;
  name: string;
  modality: CourseModality;
  status: CourseStatus;
  saleMode: CourseSaleMode;
  shortDescription: string;
  longDescription: string;
  highlights: string[];
  instructors: string[];
  coverImageUrl: string | null;
  workloadHours: number;
  location: string | null;
  startDate: string | null;
  price: number;
  originalPrice: number | null;
  promoDeadline: string | null;
  seatsLimit: number | null;
  seatsSold: number;
  pixelOverride: { enabled: boolean; pixelId: string | null };
  ementaPublished: boolean;
  featured: boolean;
  checklist: ChecklistItem[];
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  isDefault: boolean;
}

export interface EmentaModule {
  title: string;
  topics: string[];
}

export interface EmentaState {
  modules: EmentaModule[];
  materials: string[];
  generatedByAi: boolean;
}
