import { z } from "zod";

const addressSchema = z
  .object({
    postalCode: z.string().nullable().default(null),
    street: z.string().nullable().default(null),
    neighborhood: z.string().nullable().default(null),
    city: z.string().nullable().default(null),
    state: z.string().nullable().default(null),
  })
  .default({});

const utmSchema = z
  .object({
    source: z.string().nullable().default(null),
    medium: z.string().nullable().default(null),
    campaign: z.string().nullable().default(null),
    content: z.string().nullable().default(null),
    term: z.string().nullable().default(null),
  })
  .default({});

export const lookupStudentSchema = z.object({
  cpf: z.string().min(11, "Informe um CPF válido"),
  phone: z.string().min(8, "Informe um telefone válido"),
});
export type LookupStudentInput = z.infer<typeof lookupStudentSchema>;

export const startCheckoutSchema = z.object({
  courseSlug: z.string().min(1),
  studentName: z.string().min(3, "Informe seu nome completo"),
  studentEmail: z.string().email("Informe um email válido"),
  studentPhone: z.string().min(8, "Informe um telefone válido"),
  studentCpf: z.string().min(11, "Informe um CPF válido"),
  studentRg: z.string().nullable().default(null),
  studentBornDate: z.string().nullable().default(null),
  studentCivilState: z.string().nullable().default(null),
  address: addressSchema,
  utm: utmSchema,
});
export type StartCheckoutInput = z.infer<typeof startCheckoutSchema>;

export const payCheckoutSchema = z.object({
  token: z.string().optional(),
  issuer_id: z.string().optional(),
  payment_method_id: z.string().min(1),
  installments: z.number().int().positive().optional(),
  payer: z.object({
    email: z.string().email(),
    identification: z.object({ type: z.string(), number: z.string() }).optional(),
  }),
});
export type PayCheckoutInput = z.infer<typeof payCheckoutSchema>;

export const addContactNoteSchema = z.object({
  note: z.string().min(1),
});
export type AddContactNoteInput = z.infer<typeof addContactNoteSchema>;

export const updateEnrollmentSchema = z.object({
  contactStatus: z.enum(["not_contacted", "contacted", "converted", "lost"]).optional(),
  sellerId: z.string().nullable().optional(),
});
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
