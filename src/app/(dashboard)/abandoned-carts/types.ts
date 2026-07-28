export type AbandonedCartStatus = "open" | "contacted" | "converted" | "lost";
export type CheckoutStep = "identify" | "details" | "payment";

export interface AbandonedCartAdmin {
  id: string;
  courseId: string;
  courseName: string;
  courseSlug: string;
  step: CheckoutStep;
  studentName: string | null;
  studentEmail: string | null;
  studentPhone: string | null;
  studentCpf: string | null;
  status: AbandonedCartStatus;
  notes: { authorName: string; note: string; createdAt: string }[];
  utm: { source: string | null; medium: string | null; campaign: string | null; content: string | null; term: string | null };
  createdAt: string;
  lastActivityAt: string;
}
