import { MetadataRoute } from "next";

import { connectDB } from "@/server/db/client";
import * as coursesService from "@/server/modules/courses/service";

// Lê o banco pra listar os cursos — sem isso o Next tenta pré-renderizar em build time,
// onde DATABASE_URL não existe de propósito (mesmo motivo do force-dynamic no layout público).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const db = await connectDB();
  const courses = await coursesService.listPublicCourses(db);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/cursos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/paciente-modelo`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contato`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${siteUrl}/cursos/${course.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
