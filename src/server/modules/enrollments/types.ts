import { z } from "zod";

const addressField = z.string().max(200).nullable().default(null);
const addressSchema = z
  .object({
    postalCode: z.string().max(20).nullable().default(null),
    street: addressField,
    neighborhood: addressField,
    city: addressField,
    state: z.string().max(10).nullable().default(null),
  })
  .default({});

const utmValue = z.string().max(200).nullable().default(null);
const utmSchema = z
  .object({
    source: utmValue,
    medium: utmValue,
    campaign: utmValue,
    content: utmValue,
    term: utmValue,
  })
  .default({});

export const lookupStudentSchema = z.object({
  cpf: z.string().min(11, "Informe um CPF válido").max(20),
  phone: z.string().min(8, "Informe um telefone válido").max(30),
});
export type LookupStudentInput = z.infer<typeof lookupStudentSchema>;

export const startCheckoutSchema = z.object({
  courseSlug: z.string().min(1).max(200),
  sessionId: z.string().max(100).nullable().optional(),
  studentName: z.string().min(3, "Informe seu nome completo").max(200),
  studentEmail: z.string().email("Informe um email válido").max(200),
  studentPhone: z.string().min(8, "Informe um telefone válido").max(30),
  studentCpf: z.string().min(11, "Informe um CPF válido").max(20),
  studentRg: z.string().max(50).nullable().default(null),
  studentBornDate: z.string().max(20).nullable().default(null),
  studentCivilState: z.string().max(50).nullable().default(null),
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
  note: z.string().min(1).max(2000),
});
export type AddContactNoteInput = z.infer<typeof addContactNoteSchema>;

export const updateEnrollmentSchema = z.object({
  contactStatus: z.enum(["not_contacted", "contacted", "converted", "lost"]).optional(),
  sellerId: z.string().nullable().optional(),
});
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
