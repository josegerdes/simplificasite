export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export interface SiteConfigLocation {
  id: string;
  name: string;
  address: string;
  imageUrl: string | null;
}

export interface SiteConfigSocialLinks {
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
}

export interface AiAgentPersona {
  id: string;
  name: string;
  extraInstructions: string;
}

export interface SiteConfigAdmin {
  brandName: string;
  logoUrl: string;
  heroImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  pillars: { title: string; description: string }[];
  testimonials: Testimonial[];
  locations: SiteConfigLocation[];
  socialLinks: SiteConfigSocialLinks;
  whatsappNumber: string | null;
  pixel: {
    pixelId: string | null;
    testEventCode: string | null;
    enabled: boolean;
    events: { pageView: boolean; viewContent: boolean; initiateCheckout: boolean; purchase: boolean };
  };
  aiAgent: { enabled: boolean; model: string; extraInstructions: string; personas: AiAgentPersona[] };
  salesTools: { defaultSeatsLimit: number | null; urgencyBannerEnabled: boolean; urgencyBannerText: string };
}
