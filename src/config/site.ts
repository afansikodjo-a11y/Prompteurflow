/**
 * Configuration globale de l'application.
 * Centralise les métadonnées réutilisées (SEO, PWA, navigation…).
 */
export const siteConfig = {
  name: "PrompteurFlow",
  shortName: "PrompteurFlow",
  description:
    "Téléprompteur + caméra : lisez votre script et filmez la vidéo en même temps, depuis un seul appareil.",
  url: "https://prompteurflow.app",
  locale: "fr",
  themeColor: {
    light: "#ffffff",
    dark: "#0a0a0a",
  },
} as const;

export type SiteConfig = typeof siteConfig;
