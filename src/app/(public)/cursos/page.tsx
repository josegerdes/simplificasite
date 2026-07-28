import type { Metadata } from "next";

import { connectDB } from "@/server/db/client";
import * as coursesService from "@/server/modules/courses/service";
import { CatalogTabs } from "@/components/public/catalog-tabs";
import { PastCoursesSection } from "@/components/public/past-courses-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cursos de Odontologia Presenciais",
  description:
    "Especializações presenciais de odontologia com vagas limitadas e prática em pacientes reais. Garanta sua vaga pagando só a matrícula.",
  alternates: { canonical: "/cursos" },
  openGraph: { title: "Cursos de Odontologia Presenciais", url: "/cursos" },
};

export default async function CoursesCatalogPage() {
  const db = await connectDB();
  const [presencialCourses, pastCourses] = await Promise.all([
    coursesService.listPublicCourses(db, "PRESENCIAL"),
    coursesService.listPastCourses(db),
  ]);

  return (
    <main className="py-12">
      <div className="container">
        <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">Conheça os cursos da Simplifica</h1>
        <p className="mt-3 max-w-2xl text-white/60">
          Descubra como se especializar nas principais áreas da odontologia com metodologia prática e acessível.
        </p>
        <div className="mt-8">
          <CatalogTabs presencialCourses={presencialCourses} />
        </div>
      </div>

      <PastCoursesSection courses={pastCourses} />
    </main>
  );
}
