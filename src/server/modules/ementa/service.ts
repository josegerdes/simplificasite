import { Db, ObjectId } from "mongodb";

import { CourseDoc, EmentaModule } from "@/server/db/schema";
import { ApiError } from "@/server/auth/guards";
import * as coursesRepo from "@/server/modules/courses/repository";
import * as ementaRepo from "@/server/modules/ementa/repository";
import * as siteConfigRepo from "@/server/modules/site-config/repository";
import { generateEmentaDraft } from "@/server/modules/ementa/ai-generate";
import { renderEmentaPdf } from "@/server/modules/ementa/pdf";

function buildFallbackEmenta(course: Pick<CourseDoc, "highlights" | "shortDescription">): EmentaModule[] {
  const topics = course.highlights.length > 0 ? course.highlights : [course.shortDescription];
  return [
    { title: "Conteúdo Programático", topics },
    {
      title: "Prática Clínica Supervisionada",
      topics: ["Atendimento supervisionado por professores especialistas", "Discussão de casos clínicos", "Acompanhamento contínuo"],
    },
  ];
}

/**
 * A ementa nunca fica vazia — todo curso já nasce com uma (gerada pela IA se
 * OPENAI_API_KEY estiver configurada, senão um rascunho a partir dos destaques do
 * curso). O admin sempre pode editar depois; o que não existe é "curso sem ementa".
 */
export async function ensureEmentaExists(db: Db, course: CourseDoc): Promise<void> {
  const existing = await ementaRepo.findEmentaByCourseId(db, course._id);
  if (existing) return;

  if (process.env.OPENAI_API_KEY) {
    try {
      const { modules, materials } = await generateEmentaDraft({
        courseName: course.name,
        shortDescription: course.shortDescription,
        longDescription: course.longDescription,
        highlights: course.highlights,
        instructors: course.instructors,
        workloadHours: course.workloadHours,
        modality: course.modality,
      });
      await ementaRepo.upsertEmenta(db, course._id, modules, true, materials);
      return;
    } catch (error) {
      console.error("[ementa] geração por IA falhou no auto-criar, usando rascunho padrão:", error);
    }
  }

  await ementaRepo.upsertEmenta(db, course._id, buildFallbackEmenta(course), false);
}

export function toPublicEmenta(modules: EmentaModule[], materials: string[], generatedByAi: boolean) {
  return { modules, materials, generatedByAi };
}

export async function getEmenta(db: Db, courseId: string) {
  const ementa = await ementaRepo.findEmentaByCourseId(db, ObjectId.createFromHexString(courseId));
  return toPublicEmenta(ementa?.modules ?? [], ementa?.materials ?? [], ementa?.generatedByAi ?? false);
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

export async function saveEmenta(db: Db, courseId: string, modules: EmentaModule[], materials: string[] = []) {
  const updated = await ementaRepo.upsertEmenta(db, ObjectId.createFromHexString(courseId), modules, false, materials);
  return toPublicEmenta(updated?.modules ?? modules, updated?.materials ?? materials, false);
}

/**
 * Gera (ou melhora) um RASCUNHO de ementa com IA — nunca salva no banco. O admin revisa no
 * construtor e só persiste de verdade clicando em "Salvar ementa" (chama `saveEmenta`
 * separadamente). `sourceText` opcional: se vier, é usado como fonte principal — junto com
 * a ementa atual (se já existir), a IA melhora em vez de descartar; sem ementa atual, cria
 * do zero a partir do texto.
 */
export async function generateEmenta(
  db: Db,
  courseId: string,
  sourceText?: string,
  currentModulesFromClient?: EmentaModule[],
  currentMaterialsFromClient?: string[]
) {
  const course = await coursesRepo.findCourseById(db, courseId);
  if (!course) throw new ApiError(404, "Curso não encontrado");

  // Prioriza o que está na tela agora (pode ter edição manual ainda não salva) — só busca no
  // banco se o client não mandou nada (ex: chamada feita sem essa info).
  const existing = currentModulesFromClient
    ? undefined
    : await ementaRepo.findEmentaByCourseId(db, course._id);
  const currentModules = currentModulesFromClient ?? existing?.modules;
  const currentMaterials = currentMaterialsFromClient ?? existing?.materials;

  const { modules, materials } = await generateEmentaDraft({
    courseName: course.name,
    shortDescription: course.shortDescription,
    longDescription: course.longDescription,
    highlights: course.highlights,
    instructors: course.instructors,
    workloadHours: course.workloadHours,
    modality: course.modality,
    sourceText,
    currentModules,
    currentMaterials,
  });

  return toPublicEmenta(modules, materials, true);
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
    materials: ementa?.materials ?? [],
  });

  return { buffer, fileName: `ementa-${course.slug}.pdf` };
}
