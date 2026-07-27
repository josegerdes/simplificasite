export type ContactStatus = "not_contacted" | "contacted" | "converted" | "lost";
export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded" | "cancelled";

export interface EnrollmentAdmin {
  id: string;
  courseId: string;
  courseName: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentCpf: string;
  studentRg: string | null;
  studentBornDate: string | null;
  studentCivilState: string | null;
  address: {
    postalCode: string | null;
    street: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
  };
  amount: number;
  paymentStatus: PaymentStatus;
  mpPaymentId: string | null;
  sellerId: string | null;
  contactStatus: ContactStatus;
  notes: { authorName: string; note: string; createdAt: string }[];
  utm: { source: string | null; medium: string | null; campaign: string | null; content: string | null; term: string | null };
  createdAt: string;
}
