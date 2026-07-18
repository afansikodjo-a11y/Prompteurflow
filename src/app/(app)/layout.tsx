import { SiteHeader } from "@/components/layout/site-header";

/**
 * Layout des pages « app » (outil, auth, admin) — header standard, thème
 * clair/sombre adaptatif. La landing (`/`, hors de ce groupe) a son propre
 * header et une direction artistique fixe, volontairement différente.
 */
export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
