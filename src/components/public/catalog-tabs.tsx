"use client";

import { Lock } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCard, PublicCourseCardData } from "@/components/public/course-card";

const ONLINE_TEASERS = [
  "Odontologia Digital na Prática",
  "Ortodontia Alinhadores",
  "Estética Avançada em Resina",
  "Gestão de Consultório",
  "Radiologia Odontológica",
  "Endodontia Digital",
];

export function CatalogTabs({ presencialCourses }: { presencialCourses: PublicCourseCardData[] }) {
  return (
    <Tabs defaultValue="presencial">
      <TabsList className="bg-white/10">
        <TabsTrigger value="presencial" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white">
          Presencial
        </TabsTrigger>
        <TabsTrigger value="online" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white">
          Online
        </TabsTrigger>
      </TabsList>

      <TabsContent value="presencial" className="mt-8">
        {presencialCourses.length === 0 ? (
          <p className="py-16 text-center text-white/60">Nenhum curso publicado no momento — volte em breve.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {presencialCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="online" className="mt-8">
        <p className="mb-6 text-white/60">
          Nossos cursos online estão a caminho — cadastre-se em um curso presencial e seja avisado em primeira mão.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ONLINE_TEASERS.map((title) => (
            <div key={title} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br from-brand-teal/40 to-brand-ink ring-1 ring-white/10">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-md">
                <Lock className="h-8 w-8 text-white/70" />
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Em breve
                </span>
                <p className="px-6 text-center font-heading text-sm font-semibold text-white/90">{title}</p>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
