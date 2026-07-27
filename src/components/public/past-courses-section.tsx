import { CheckCircle2 } from "lucide-react";

export interface PastCourseData {
  id: string;
  slug: string;
  name: string;
  modality: "PRESENCIAL" | "ONLINE";
  coverImageUrl: string | null;
  startDate: string | null;
  workloadHours: number;
}

/** Turmas já concluídas — só prova social (credibilidade), sem CTA de compra. */
export function PastCoursesSection({ courses }: { courses: PastCourseData[] }) {
  if (courses.length === 0) return null;

  return (
    <section className="border-t border-white/10 py-12">
      <div className="container">
        <h2 className="font-heading text-xl font-bold text-white">Turmas já realizadas</h2>
        <p className="mt-1 text-sm text-white/50">Um retrato de quem já passou pela Simplifica Doctor</p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-teal" />
              <div>
                <p className="text-sm font-medium text-white/90">{course.name}</p>
                {course.startDate && <p className="text-xs text-white/40">{course.startDate}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
