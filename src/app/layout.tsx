import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import { Providers } from "@/app/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-poppins" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Simplifica Doctor — Cursos de Odontologia com Prática em Pacientes Reais",
    template: "%s | Simplifica Doctor",
  },
  description:
    "Especializações e cursos presenciais de odontologia com prática clínica em pacientes reais. Garanta sua vaga pagando só a matrícula — vagas limitadas.",
  icons: { icon: "/logo.png" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Simplifica Doctor",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
