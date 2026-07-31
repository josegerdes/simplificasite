import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Simplifica Doctor",
    short_name: "Simplifica Doctor",
    description: "Especializações e cursos presenciais de odontologia com prática clínica em pacientes reais.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1b1e",
    theme_color: "#3fada3",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
