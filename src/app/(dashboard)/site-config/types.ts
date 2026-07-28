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
  whatsappNumber: string | null;
  pixel: {
    pixelId: string | null;
    testEventCode: string | null;
    enabled: boolean;
    events: { pageView: boolean; viewContent: boolean; initiateCheckout: boolean; purchase: boolean };
  };
  aiAgent: { enabled: boolean; model: string; extraInstructions: string };
  salesTools: { defaultSeatsLimit: number | null; urgencyBannerEnabled: boolean; urgencyBannerText: string };
}
