import type { LucideIcon } from "lucide-react";
import { MonitorPlay, Settings } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Éléments de navigation principaux.
 */
export const mainNav: NavItem[] = [
  { title: "Studio", href: "/", icon: MonitorPlay },
  { title: "Paramètres", href: "/settings", icon: Settings },
];
