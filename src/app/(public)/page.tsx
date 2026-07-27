import Link from "next/link";
import { MapPin, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { connectDB } from "@/server/db/client";
import * as siteConfigService from "@/server/modules/site-config/service";
import * as coursesService from "@/server/modules/courses/service";
import { CourseRow } from "@/components/public/course-row";
import { CourseCard } from "@/components/public/course-card";
import { OnlineTeaserRow } from "@/components/public/online-teaser-row";
import { TestimonialsCarousel } from "@/components/public/testimonials-carousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await connectDB();
  const [config, presencialCourses] = await Promise.all([
    siteConfigService.getPublicSiteConfig(db),
    coursesService.listPublicCourses(db, "PRESENCIAL"),
  ]);

  return (
    <main>
      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/banners/pratica-implanto.webp)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/85 to-brand-ink/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand-ink/40 to-transparent" />

        <div className="container relative">
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand-teal">
            <Sparkles className="h-4 w-4" />
            {config.brandName}
          </p>
          <h1 className="font-heading max-w-2xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
            {config.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">{config.heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="xl" variant="cta">
              <Link href="/cursos">Ver cursos disponíveis</Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link href="#depoimentos">Ver depoimentos</Link>
            </Button>
          </div>
        </div>
      </section>

      {config.salesTools.urgencyBannerEnabled && (
        <div className="bg-brand-teal py-2.5 text-center text-sm font-semibold text-white">
          {config.salesTools.urgencyBannerText}
        </div>
      )}

      <div className="py-10">
        {presencialCourses.length > 0 && (
          <CourseRow title="Cursos Presenciais" subtitle="Turmas abertas com vagas limitadas">
            {presencialCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </CourseRow>
        )}

        <OnlineTeaserRow />
      </div>

      <section className="border-y border-white/10 bg-white/[0.03] py-16">
        <div className="container">
          <h2 className="font-heading text-center text-2xl font-bold text-white md:text-3xl">
            Conheça os pilares que nos tornam referência
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {config.pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <ShieldCheck className="mb-3 h-6 w-6 text-brand-teal" />
                <h3 className="font-heading mb-2 font-semibold text-white">{pillar.title}</h3>
                <p className="text-sm text-white/60">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="depoimentos" className="py-16">
        <div className="container">
          <h2 className="font-heading text-center text-2xl font-bold text-white md:text-3xl">
            Confira os depoimentos dos nossos alunos
          </h2>
          <div className="mt-10">
            <TestimonialsCarousel testimonials={config.testimonials} />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-brand-teal to-brand-tealDark py-16">
        <div className="container flex flex-col items-center gap-6 text-center">
          <MapPin className="h-8 w-8 text-white" />
          <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">Onde estamos</h2>
          <p className="text-white/90">{config.location}</p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/cursos">Quero garantir minha vaga</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
