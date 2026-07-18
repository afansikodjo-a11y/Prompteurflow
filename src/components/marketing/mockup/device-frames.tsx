import type * as React from "react";

import { cn } from "@/lib/utils";

interface DeviceFrameProps {
  children: React.ReactNode;
  className?: string;
}

/** Cadre CSS (pas une image) simulant un téléphone — encadre un visuel produit. */
export function PhoneFrame({ children, className }: DeviceFrameProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[240px] rounded-[2.5rem] border-[6px] border-neutral-900 bg-neutral-900 p-1.5 shadow-xl dark:border-neutral-700",
        className,
      )}
    >
      <div className="absolute top-2.5 left-1/2 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-neutral-900 dark:bg-neutral-700" />
      <div className="overflow-hidden rounded-[2rem]">{children}</div>
    </div>
  );
}

/** Cadre CSS simulant une tablette (bords plus épais, pas d'encoche). */
export function TabletFrame({ children, className }: DeviceFrameProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-sm rounded-[1.75rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-xl dark:border-neutral-700",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[0.9rem]">{children}</div>
    </div>
  );
}

/** Cadre CSS simulant un ordinateur portable (écran + base). */
export function LaptopFrame({ children, className }: DeviceFrameProps) {
  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      <div className="rounded-t-xl border-[10px] border-b-0 border-neutral-900 bg-neutral-900 shadow-xl dark:border-neutral-700">
        <div className="overflow-hidden rounded-t-sm">{children}</div>
      </div>
      <div className="h-3 rounded-b-xl bg-neutral-800 shadow-xl dark:bg-neutral-600" />
      <div className="mx-auto h-1.5 w-1/3 rounded-b-lg bg-neutral-700 dark:bg-neutral-500" />
    </div>
  );
}
