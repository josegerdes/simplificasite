import { Db, ObjectId } from "mongodb";

import { ContactNote, EnrollmentDoc } from "@/server/db/schema";
import { ApiError } from "@/server/auth/guards";
import { Session } from "@/server/auth/session";
import { resolveSellerScope } from "@/server/auth/guards";
import * as enrollmentsRepo from "@/server/modules/enrollments/repository";
import * as coursesRepo from "@/server/modules/courses/repository";
import { AddContactNoteInput, UpdateEnrollmentInput } from "@/server/modules/enrollments/types";

export function toAdminEnrollment(enrollment: EnrollmentDoc) {
  return {
    id: enrollment._id.toHexString(),
    courseId: enrollment.courseId.toHexString(),
    studentName: enrollment.studentName,
    studentEmail: enrollment.studentEmail,
    studentPhone: enrollment.studentPhone,
    studentCpf: enrollment.studentCpf,
    studentRg: enrollment.studentRg,
    studentBornDate: enrollment.studentBornDate,
    studentCivilState: enrollment.studentCivilState,
    address: enrollment.address,
    amount: enrollment.amount,
    paymentStatus: enrollment.paymentStatus,
    mpPaymentId: enrollment.mpPaymentId,
    sellerId: enrollment.sellerId ? enrollment.sellerId.toHexString() : null,
    contactStatus: enrollment.contactStatus,
    notes: enrollment.notes.map((note) => ({
      authorName: note.authorName,
      note: note.note,
      createdAt: note.createdAt,
    })),
    utm: enrollment.utm,
    createdAt: enrollment.createdAt,
  };
}

export async function listEnrollments(
  db: Db,
  session: Session,
  filters: { courseId?: string; status?: string }
) {
  const scope = resolveSellerScope(session);
  const enrollments = await enrollmentsRepo.findAllEnrollments(db, {
    sellerId: scope.sellerId === null ? undefined : scope.sellerId,
    courseId: filters.courseId,
    status: filters.status,
  });

  const courseIds = Array.from(new Set(enrollments.map((e) => e.courseId.toHexString())));
  const courses = await Promise.all(courseIds.map((id) => coursesRepo.findCourseById(db, id)));
  const courseNameById = new Map(courses.filter(Boolean).map((c) => [c!._id.toHexString(), c!.name]));

  return enrollments.map((enrollment) => ({
    ...toAdminEnrollment(enrollment),
    courseName: courseNameById.get(enrollment.courseId.toHexString()) ?? "Curso removido",
  }));
}

function assertCanAccessEnrollment(session: Session, enrollment: EnrollmentDoc) {
  const scope = resolveSellerScope(session);
  if (scope.sellerId === null) return; // sem restrição
  if (!enrollment.sellerId || enrollment.sellerId.toHexString() !== scope.sellerId) {
    throw new ApiError(403, "Esta matrícula não está atribuída a você");
  }
}

export async function updateEnrollment(db: Db, session: Session, enrollmentId: string, input: UpdateEnrollmentInput) {
  const enrollment = await enrollmentsRepo.findEnrollmentById(db, enrollmentId);
  if (!enrollment) throw new ApiError(404, "Matrícula não encontrada");
  assertCanAccessEnrollment(session, enrollment);

  let updated = enrollment;
  if (input.contactStatus) {
    const result = await enrollmentsRepo.updateContactStatus(db, enrollmentId, input.contactStatus);
    if (result) updated = result;
  }
  if (input.sellerId !== undefined) {
    const result = await enrollmentsRepo.assignSeller(db, enrollmentId, input.sellerId);
    if (result) updated = result;
  }
  return toAdminEnrollment(updated);
}

export async function addContactNote(db: Db, session: Session, enrollmentId: string, input: AddContactNoteInput) {
  const enrollment = await enrollmentsRepo.findEnrollmentById(db, enrollmentId);
  if (!enrollment) throw new ApiError(404, "Matrícula não encontrada");
  assertCanAccessEnrollment(session, enrollment);

  const note: ContactNote = {
    authorId: ObjectId.createFromHexString(session.userId),
    authorName: session.name,
    note: input.note,
    createdAt: new Date(),
  };
  const updated = await enrollmentsRepo.addNote(db, enrollmentId, note);
  if (!updated) throw new ApiError(404, "Matrícula não encontrada");
  return toAdminEnrollment(updated);
}
