import { randomUUID } from "crypto";

import { Db, ObjectId } from "mongodb";

import { CourseChecklistItem, CourseDoc, CourseModality } from "@/server/db/schema";
import { ApiError } from "@/server/auth/guards";
import * as coursesRepo from "@/server/modules/courses/repository";
import { CreateCourseInput, UpdateCourseInput } from "@/server/modules/courses/types";

/** Passos típicos entre "decidimos abrir esse curso" e "curso pronto pra ir ao ar" — guia o
 *  admin, não bloqueia a publicação (o toggle "Publicado" continua livre). */
const DEFAULT_CHECKLIST_LABELS = [
  "Pegar ementa/conteúdo detalhado com o professor",
  "Confirmar carga horária, datas e turma",
  "Criar artes e banners de divulgação",
  "Configurar preço, vagas e ferramentas de venda",
  "Revisar descrição, destaques e depoimentos",
  "Gerar e revisar a ementa em PDF",
];

function createDefaultChecklist(): CourseChecklistItem[] {
  return DEFAULT_CHECKLIST_LABELS.map((label) => ({ id: randomUUID(), label, done: false, isDefault: true }));
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(db: Db, name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let suffix = 2;
  while (await coursesRepo.findCourseBySlug(db, slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export function toAdminCourse(course: CourseDoc) {
  return {
    id: course._id.toHexString(),
    slug: course.slug,
    name: course.name,
    modality: course.modality,
    status: course.status,
    shortDescription: course.shortDescription,
    longDescription: course.longDescription,
    highlights: course.highlights,
    instructors: course.instructors,
    coverImageUrl: course.coverImageUrl,
    workloadHours: course.workloadHours,
    location: course.location,
    startDate: course.startDate,
    price: course.price,
    originalPrice: course.originalPrice,
    promoDeadline: course.promoDeadline,
    seatsLimit: course.seatsLimit,
    seatsSold: course.seatsSold,
    checklist: course.checklist,
    pixelOverride: course.pixelOverride,
    ementaPublished: course.ementaPublished,
    createdAt: course.createdAt,
  };
}

/** Versão para o site — nunca vaza dados internos (status draft não aparece nunca, pois
 *  `findPublishedCourses` já filtra; aqui só formatamos o que a vitrine precisa). */
export function toVisitorCourse(course: CourseDoc) {
  const seatsRemaining =
    course.seatsLimit !== null ? Math.max(0, course.seatsLimit - course.seatsSold) : null;
  const soldOut = course.status === "SOLD_OUT" || (seatsRemaining !== null && seatsRemaining <= 0);

  return {
    id: course._id.toHexString(),
    slug: course.slug,
    name: course.name,
    modality: course.modality,
    shortDescription: course.shortDescription,
    longDescription: course.longDescription,
    highlights: course.highlights,
    instructors: course.instructors,
    coverImageUrl: course.coverImageUrl,
    workloadHours: course.workloadHours,
    location: course.location,
    startDate: course.startDate,
    price: course.price,
    originalPrice: course.originalPrice,
    promoDeadline: course.promoDeadline,
    seatsRemaining,
    soldOut,
    ementaPublished: course.ementaPublished,
  };
}

export async function listCoursesAdmin(db: Db) {
  const courses = await coursesRepo.findAllCourses(db);
  return courses.map(toAdminCourse);
}

export async function getCourseAdmin(db: Db, id: string) {
  const course = await coursesRepo.findCourseById(db, id);
  if (!course) throw new ApiError(404, "Curso não encontrado");
  return toAdminCourse(course);
}

export async function listPublicCourses(db: Db, modality?: CourseModality) {
  const courses = await coursesRepo.findPublishedCourses(db, modality);
  return courses.map(toVisitorCourse);
}

export async function getPublicCourseBySlug(db: Db, slug: string) {
  const course = await coursesRepo.findCourseBySlug(db, slug);
  if (!course || !["PUBLISHED", "SOLD_OUT"].includes(course.status)) {
    throw new ApiError(404, "Curso não encontrado");
  }
  return toVisitorCourse(course);
}

export async function createCourse(db: Db, input: CreateCourseInput) {
  const now = new Date();
  const course: CourseDoc = {
    _id: new ObjectId(),
    slug: await uniqueSlug(db, input.name),
    name: input.name,
    modality: input.modality,
    status: "DRAFT",
    shortDescription: input.shortDescription,
    longDescription: input.longDescription,
    highlights: input.highlights,
    instructors: input.instructors,
    coverImageUrl: input.coverImageUrl,
    workloadHours: input.workloadHours,
    location: input.location,
    startDate: input.startDate,
    price: input.price,
    originalPrice: input.originalPrice,
    promoDeadline: input.promoDeadline,
    seatsLimit: input.seatsLimit,
    seatsSold: 0,
    pixelOverride: { enabled: false, pixelId: null },
    ementaPublished: false,
    checklist: createDefaultChecklist(),
    createdAt: now,
    updatedAt: now,
  };
  await coursesRepo.insertCourse(db, course);
  return toAdminCourse(course);
}

export async function updateChecklist(db: Db, courseId: string, items: CourseChecklistItem[]) {
  const updated = await coursesRepo.updateCourse(db, courseId, { checklist: items });
  if (!updated) throw new ApiError(404, "Curso não encontrado");
  return toAdminCourse(updated);
}

export async function updateCourse(db: Db, courseId: string, input: UpdateCourseInput) {
  const patch: Partial<CourseDoc> = { ...input };
  if (input.name) {
    const current = await coursesRepo.findCourseById(db, courseId);
    if (current && input.name !== current.name) {
      patch.slug = await uniqueSlug(db, input.name);
    }
  }
  const updated = await coursesRepo.updateCourse(db, courseId, patch);
  if (!updated) throw new ApiError(404, "Curso não encontrado");
  return toAdminCourse(updated);
}

export async function deleteCourse(db: Db, courseId: string) {
  const enrollmentCount = await coursesRepo.countEnrollmentsForCourse(db, courseId);
  if (enrollmentCount > 0) {
    throw new ApiError(409, "Este curso já tem matrículas — desative-o em vez de excluir");
  }
  await coursesRepo.deleteCourse(db, courseId);
}
