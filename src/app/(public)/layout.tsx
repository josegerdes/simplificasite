import { connectDB } from "@/server/db/client";
import * as siteConfigService from "@/server/modules/site-config/service";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { PixelScript } from "@/components/public/pixel-script";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const db = await connectDB();
  const config = await siteConfigService.getPublicSiteConfig(db);

  return (
    <div className="min-h-screen bg-brand-ink">
      <PixelScript pixel={config.pixel} />
      <SiteHeader brandName={config.brandName} logoUrl={config.logoUrl} />
      {children}
      <SiteFooter brandName={config.brandName} logoUrl={config.logoUrl} location={config.location} whatsappNumber={config.whatsappNumber} />
    </div>
  );
}
