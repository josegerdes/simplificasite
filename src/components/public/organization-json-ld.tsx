interface Location {
  id: string;
  name: string;
  address: string;
}

/** Dados estruturados (schema.org) da organização + cada unidade física — ajuda o Google a
 *  entender que é uma escola de verdade, com endereço, pra aparecer melhor em buscas locais
 *  ("curso de odontologia perto de mim") e no Google Business/Maps. */
export function OrganizationJsonLd({
  brandName,
  logoUrl,
  locations,
}: {
  brandName: string;
  logoUrl: string;
  locations: Location[];
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const absoluteLogoUrl = logoUrl.startsWith("http") ? logoUrl : `${siteUrl}${logoUrl}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        name: brandName,
        logo: absoluteLogoUrl,
        url: siteUrl,
        department: locations.map((location) => ({
          "@type": "LocalBusiness",
          name: `${brandName} — ${location.name}`,
          address: location.address,
        })),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
