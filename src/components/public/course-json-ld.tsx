interface VisitorCourse {
  slug: string;
  name: string;
  shortDescription: string;
  coverImageUrl: string | null;
  workloadHours: number;
  location: string | null;
  price: number;
  soldOut: boolean;
}

/** Dados estruturados (schema.org/Course) — ajuda o Google a mostrar preço, modalidade e
 *  disponibilidade direto no resultado de busca (rich snippet) em vez de só um link azul. */
export function CourseJsonLd({ course, brandName }: { course: VisitorCourse; brandName: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const absoluteImageUrl = course.coverImageUrl
    ? course.coverImageUrl.startsWith("http")
      ? course.coverImageUrl
      : `${siteUrl}${course.coverImageUrl}`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.shortDescription,
    provider: { "@type": "EducationalOrganization", name: brandName, sameAs: siteUrl },
    ...(absoluteImageUrl ? { image: absoluteImageUrl } : {}),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Onsite",
      courseWorkload: `PT${course.workloadHours}H`,
      ...(course.location ? { location: { "@type": "Place", name: course.location } } : {}),
    },
    offers: {
      "@type": "Offer",
      category: "Matrícula",
      price: course.price,
      priceCurrency: "BRL",
      availability: course.soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: `${siteUrl}/cursos/${course.slug}`,
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
