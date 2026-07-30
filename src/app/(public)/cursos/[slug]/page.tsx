import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { connectDB } from "@/server/db/client";
import * as coursesService from "@/server/modules/courses/service";
import * as ementaService from "@/server/modules/ementa/service";
import * as siteConfigService from "@/server/modules/site-config/service";
import { ApiError } from "@/server/auth/guards";
import { CheckoutPanel } from "@/components/public/checkout-panel";
import { CourseLeadPanel } from "@/components/public/course-lead-panel";
import { ViewContentTracker } from "@/components/public/view-content-tracker";
import { EmentaSection } from "@/components/public/ementa-section";
import { InstitutionalSection } from "@/components/public/institutional-section";
import { CourseJsonLd } from "@/components/public/course-json-ld";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const db = await connectDB();
  try {
    const course = await coursesService.getPublicCourseBySlug(db, params.slug);
    const title = `${course.name} — Matrícula por R$${course.price.toFixed(0)}`;
    return {
      title,
      description: course.shortDescription,
      alternates: { canonical: `/cursos/${course.slug}` },
      openGraph: {
        title,
        description: course.shortDescription,
        url: `/cursos/${course.slug}`,
        images: course.coverImageUrl ? [{ url: course.coverImageUrl }] : undefined,
      },
      twitter: { title, description: course.shortDescription, images: course.coverImageUrl ? [course.coverImageUrl] : undefined },
    };
  } catch {
    return { title: "Curso não encontrado" };
  }
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const db = await connectDB();
  let course;
  try {
    course = await coursesService.getPublicCourseBySlug(db, params.slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const [ementaModules, siteConfig] = await Promise.all([
    ementaService.getPublishedEmentaModules(db, course.id, course.ementaPublished),
    siteConfigService.getPublicSiteConfig(db),
  ]);

  return (
    <main>
      <ViewContentTracker courseSlug={course.slug} courseName={course.name} price={course.price} />
      <CourseJsonLd course={course} brandName={siteConfig.brandName} />

      <section className="relative">
        <div
          className="h-72 bg-cover bg-center md:h-96"
          style={{ backgroundImage: course.coverImageUrl ? `url(${course.coverImageUrl})` : undefined }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/70 to-brand-ink/30" />
        </div>
        <div className="container relative -mt-24 pb-8">
          <Badge className="mb-3 bg-brand-teal text-white">{course.modality === "PRESENCIAL" ? "Presencial" : "Online"}</Badge>
          <h1 className="font-heading max-w-3xl text-3xl font-extrabold text-white md:text-5xl">{course.name}</h1>
          <p className="mt-4 max-w-2xl text-white/80">{course.shortDescription}</p>
        </div>
      </section>

      <section className="container grid grid-cols-1 gap-10 pb-28 lg:grid-cols-[1fr_380px] lg:pb-20">
        <div className="space-y-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoStat icon={<Clock className="h-5 w-5" />} label="Carga horária" value={`${course.workloadHours}h`} />
            <InfoStat icon={<CalendarDays className="h-5 w-5" />} label="Início" value={course.startDate ?? "A definir"} />
            <InfoStat icon={<MapPin className="h-5 w-5" />} label="Local" value={course.location ?? "A definir"} />
            <InfoStat
              icon={<Users className="h-5 w-5" />}
              label="Vagas"
              value={course.seatsRemaining !== null ? `${course.seatsRemaining} restantes` : "Abertas"}
            />
          </div>

          {course.longDescription && (
            <div>
              <h2 className="font-heading mb-3 text-xl font-bold text-white">Sobre o curso</h2>
              <p className="whitespace-pre-line text-white/70">{course.longDescription}</p>
            </div>
          )}

          {course.highlights.length > 0 && (
            <div>
              <h2 className="font-heading mb-3 text-xl font-bold text-white">Destaques</h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {course.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.instructors.length > 0 && (
            <div>
              <h2 className="font-heading mb-3 text-xl font-bold text-white">Corpo docente</h2>
              <p className="text-white/70">{course.instructors.join(", ")}</p>
            </div>
          )}

          <EmentaSection modules={ementaModules} courseSlug={course.slug} price={course.price} />

          <InstitutionalSection brandName={siteConfig.brandName} pillars={siteConfig.pillars} locations={siteConfig.locations} />
        </div>

        <div id="matricula">
          {course.saleMode === "lead" ? <CourseLeadPanel course={course} /> : <CheckoutPanel course={course} />}
        </div>
      </section>
    </main>
  );
}

function InfoStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-2 text-brand-teal">{icon}</div>
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
