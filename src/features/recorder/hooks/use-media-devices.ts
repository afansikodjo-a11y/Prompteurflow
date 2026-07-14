"use client";

import * as React from "react";

export interface UseMediaDevicesResult {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  /** Re-énumère les périphériques (à appeler une fois la permission accordée). */
  refresh: () => Promise<void>;
}

/**
 * Énumère les caméras et micros disponibles.
 *
 * Note : les *labels* des périphériques ne sont renseignés qu'après l'octroi de
 * la permission caméra/micro — d'où l'exposition de `refresh()`, à déclencher
 * quand le flux devient prêt, et l'écoute de l'événement `devicechange`.
 */
export function useMediaDevices(): UseMediaDevicesResult {
  const [cameras, setCameras] = React.useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = React.useState<MediaDeviceInfo[]>([]);

  const refresh = React.useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((device) => device.kind === "videoinput"));
      setMicrophones(devices.filter((device) => device.kind === "audioinput"));
    } catch {
      // Énumération indisponible : on garde les listes en l'état.
    }
  }, []);

  React.useEffect(() => {
    void refresh();
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices) return;
    mediaDevices.addEventListener("devicechange", refresh);
    return () => mediaDevices.removeEventListener("devicechange", refresh);
  }, [refresh]);

  return { cameras, microphones, refresh };
}
