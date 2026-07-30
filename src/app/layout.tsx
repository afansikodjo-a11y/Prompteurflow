import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";

import "./globals.css";

import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColor.dark },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={siteConfig.locale} suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} min-h-dvh font-sans antialiased`}>
        {/* Capture `beforeinstallprompt` le plus tôt possible, avant même
            l'hydratation React — Chrome peut le déclencher avant que le
            useEffect de `useInstallPrompt` n'ait eu le temps de s'attacher,
            auquel cas l'évènement est perdu pour de bon et le bouton
            "Installer" retombe à tort sur les instructions manuelles. Stashé
            sur `window.__bip`, relu par `useInstallPrompt` à son montage. */}
        <Script id="capture-install-prompt" strategy="beforeInteractive">
          {`
            window.__bip = null;
            window.addEventListener("beforeinstallprompt", function (e) {
              e.preventDefault();
              window.__bip = e;
            });
          `}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
