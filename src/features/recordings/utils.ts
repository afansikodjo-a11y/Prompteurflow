/** Formate une taille en octets → `Ko`/`Mo` lisibles. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(0)} Ko`;
  return `${(kilobytes / 1024).toFixed(1)} Mo`;
}

/** Formate une durée (secondes) au format `m:ss`. */
export function formatClipDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Formate un horodatage → date + heure lisibles (fr-FR). */
export function formatClipDate(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}
