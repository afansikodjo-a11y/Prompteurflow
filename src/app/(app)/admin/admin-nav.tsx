"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/affiliates", label: "Affiliation" },
  { href: "/admin/clients", label: "Clients" },
];

/** Nav à onglets de l'espace admin — chrome de route, pas une métrique du dashboard. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="mx-auto flex max-w-5xl gap-1 px-4">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
