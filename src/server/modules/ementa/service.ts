import { Db, ObjectId } from "mongodb";

import { EmentaModule } from "@/server/db/schema";
import { ApiError } from "@/server/auth/guards";
import * as coursesRepo from "@/server/modules/courses/repository";
import * as ementaRepo from "@/server/modules/ementa/repository";
import * as siteConfigRepo from "@/server/modules/site-config/repository";
import { generateEmentaDraft } from "@/server/modules/ementa/ai-generate";
import { renderEmentaPdf } from "@/server/modules/ementa/pdf";

export function toPublicEmenta(modules: EmentaModule[], generatedByAi: boolean) {
  return { modules, generatedByAi };
}

export async function getEmenta(db: Db, courseId: string) {
  const ementa = await ementaRepo.findEmentaByCourseId(db, ObjectId.createFromHexString(courseId));
  return toPublicEmenta(ementa?.modules ?? [], ementa?.generatedByAi ?? false);
}

/** Versão pública — só devolve os módulos se o admin marcou a ementa como publicada,
 *  pra a página do curso poder renderizar a seção visual (não só o link do PDF). */
export async function getPublishedEmentaModules(
  db: Db,
  courseId: string,
  ementaPublished: boolean
): Promise<EmentaModule[]> {
  if (!ementaPublished) return [];
  const ementa = await ementaRepo.findEmentaByCourseId(db, ObjectId.createFromHexString(courseId));
  return ementa?.modules ?? [];
}

export async function saveEmenta(db: Db, courseId: string, modules: EmentaModule[]) {
  const updated = await ementaRepo.upsertEmenta(db, ObjectId.createFromHexString(courseId), modules, false);
  return toPublicEmenta(updated?.modules ?? modules, false);
}

export async function generateEmenta(db: Db, courseId: string) {
  const course = await coursesRepo.findCourseById(db, courseId);
  if (!course) throw new ApiError(404, "Curso não encontrado");

  const modules = await generateEmentaDraft({
    courseName: course.name,
    shortDescription: course.shortDescription,
    workloadHours: course.workloadHours,
    modality: course.modality,
  });

  const updated = await ementaRepo.upsertEmenta(db, course._id, modules, true);
  return toPublicEmenta(updated?.modules ?? modules, true);
}

export async function setEmentaPublished(db: Db, courseId: string, published: boolean) {
  const updated = await coursesRepo.updateCourse(db, courseId, { ementaPublished: published });
  if (!updated) throw new ApiError(404, "Curso não encontrado");
  return { ementaPublished: updated.ementaPublished };
}

export async function getEmentaPdfBuffer(db: Db, slug: string): Promise<{ buffer: Buffer; fileName: string }> {
  const course = await coursesRepo.findCourseBySlug(db, slug);
  if (!course || !course.ementaPublished) {
    throw new ApiError(404, "Ementa não disponível para este curso");
  }
  const ementa = await ementaRepo.findEmentaByCourseId(db, course._id);
  const config = await siteConfigRepo.getOrCreateSiteConfig(db);

  const buffer = await renderEmentaPdf({
    courseName: course.name,
    modality: course.modality,
    workloadHours: course.workloadHours,
    brandName: config.brandName,
    modules: ementa?.modules ?? [],
  });

  return { buffer, fileName: `ementa-${course.slug}.pdf` };
}
