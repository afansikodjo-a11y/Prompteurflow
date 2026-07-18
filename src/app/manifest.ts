import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Manifest PWA généré par Next.js → exposé sur `/manifest.webmanifest`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    // Ouvre directement l'outil, pas la page de vente : un utilisateur qui
    // installe l'app veut filmer, pas revoir l'argumentaire marketing.
    start_url: "/studio",
    scope: "/",
    display: "standalone",
    background_color: siteConfig.themeColor.dark,
    theme_color: siteConfig.themeColor.dark,
    orientation: "any",
    lang: siteConfig.locale,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
