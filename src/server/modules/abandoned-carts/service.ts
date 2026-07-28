import { Db, ObjectId } from "mongodb";

import { AbandonedCartDoc, ContactNote } from "@/server/db/schema";
import { ApiError } from "@/server/auth/guards";
import { Session } from "@/server/auth/session";
import { onlyDigits } from "@/server/lib/normalize";
import * as coursesRepo from "@/server/modules/courses/repository";
import * as abandonedCartsRepo from "@/server/modules/abandoned-carts/repository";
import { TrackAbandonedCartInput } from "@/server/modules/abandoned-carts/types";

/** Só vale a pena salvar se a pessoa já digitou pelo menos um dado identificável — abrir o
 *  checkout e fechar sem escrever nada não é um lead, é ruído. */
function hasIdentifyingData(input: TrackAbandonedCartInput): boolean {
  return Boolean(
    input.studentName?.trim() || input.studentEmail?.trim() || input.studentPhone?.trim() || input.studentCpf?.trim()
  );
}

export async function trackCheckoutProgress(db: Db, input: TrackAbandonedCartInput): Promise<void> {
  if (!hasIdentifyingData(input)) return;

  const course = await coursesRepo.findCourseBySlug(db, input.courseSlug);
  if (!course) return;

  await abandonedCartsRepo.upsertBySessionAndCourse(db, input.sessionId, course._id, {
    courseName: course.name,
    courseSlug: course.slug,
    step: input.step,
    studentName: input.studentName?.trim() || null,
    studentEmail: input.studentEmail?.trim() || null,
    studentPhone: input.studentPhone ? onlyDigits(input.studentPhone) : null,
    studentCpf: input.studentCpf ? onlyDigits(input.studentCpf) : null,
    utm: input.utm,
  });
}

export async function markConverted(db: Db, sessionId: string | undefined, courseId: ObjectId, enrollmentId: ObjectId): Promise<void> {
  if (!sessionId) return;
  await abandonedCartsRepo.markConverted(db, sessionId, courseId, enrollmentId);
}

function toAdmin(cart: AbandonedCartDoc) {
  return {
    id: cart._id.toHexString(),
    courseId: cart.courseId.toHexString(),
    courseName: cart.courseName,
    courseSlug: cart.courseSlug,
    step: cart.step,
    studentName: cart.studentName,
    studentEmail: cart.studentEmail,
    studentPhone: cart.studentPhone,
    studentCpf: cart.studentCpf,
    status: cart.status,
    notes: cart.notes.map((note) => ({ authorName: note.authorName, note: note.note, createdAt: note.createdAt })),
    utm: cart.utm,
    createdAt: cart.createdAt,
    lastActivityAt: cart.lastActivityAt,
  };
}

export async function listAbandonedCarts(db: Db) {
  const carts = await abandonedCartsRepo.findAll(db);
  return carts.map(toAdmin);
}

export async function updateAbandonedCartStatus(db: Db, id: string, status: AbandonedCartDoc["status"]) {
  const updated = await abandonedCartsRepo.updateStatus(db, id, status);
  if (!updated) throw new ApiError(404, "Carrinho não encontrado");
  return toAdmin(updated);
}

export async function addAbandonedCartNote(db: Db, session: Session, id: string, noteText: string) {
  const note: ContactNote = {
    authorId: ObjectId.createFromHexString(session.userId),
    authorName: session.name,
    note: noteText,
    createdAt: new Date(),
  };
  const updated = await abandonedCartsRepo.addNote(db, id, note);
  if (!updated) throw new ApiError(404, "Carrinho não encontrado");
  return toAdmin(updated);
}
