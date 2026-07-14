import { dirname } from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/**
 * Configuration PWA (Serwist).
 * Le service worker est généré à partir de `src/app/sw.ts` vers `public/sw.js`.
 * Il est désactivé en développement pour éviter les problèmes de cache.
 */
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ancre la racine de traçage sur ce projet (plusieurs lockfiles détectés sur la machine).
  outputFileTracingRoot: projectRoot,
};

export default withSerwist(nextConfig);
