import { connectDB } from "@/server/db/client";
import * as siteConfigService from "@/server/modules/site-config/service";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { PixelScript } from "@/components/public/pixel-script";
import { AiChatWidget } from "@/components/public/ai-chat-widget";

// Todo o grupo (public) depende do banco (site-config) já no layout — força dynamic
// pra NENHUMA página filha ser pré-renderizada em build time, onde DATABASE_URL não
// existe de propósito (Docker builda a imagem antes das env vars de runtime existirem).
// Sem isso, basta uma página nova esquecer o próprio `export const dynamic` pra
// quebrar o build inteiro (foi exatamente o que aconteceu com /matricula/sucesso).
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const db = await connectDB();
  const config = await siteConfigService.getPublicSiteConfig(db);

  return (
    <div className="min-h-screen bg-brand-ink">
      <PixelScript pixel={config.pixel} />
      <SiteHeader brandName={config.brandName} logoUrl={config.logoUrl} />
      {children}
      <SiteFooter
        brandName={config.brandName}
        logoUrl={config.logoUrl}
        locations={config.locations}
        socialLinks={config.socialLinks}
        whatsappNumber={config.whatsappNumber}
      />
      {config.aiAgentEnabled && <AiChatWidget brandName={config.brandName} personas={config.aiAgentPersonas} />}
    </div>
  );
}
