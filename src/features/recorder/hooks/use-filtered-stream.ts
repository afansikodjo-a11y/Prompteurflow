"use client";

import * as React from "react";

import { FILTER_PRESETS } from "../constants";
import type { VideoFilterId } from "../types";

/**
 * Applique un filtre de style visuel (CSS `filter`) à un flux caméra, gravé
 * directement dans les pixels via un pipeline canvas.
 *
 * C'est nécessaire pour que le filtre apparaisse dans l'enregistrement final :
 * `MediaRecorder` capture les pixels du flux qu'on lui donne, pas le rendu
 * stylé du DOM — un simple CSS `filter` sur un `<video>` de preview ne
 * ressortirait jamais dans le fichier exporté.
 *
 * Sans filtre (`"none"`), le flux source est retourné tel quel : aucun coût
 * canvas/RAF n'est payé dans le cas courant (pas de filtre sélectionné).
 */
export function useFilteredStream(
  source: MediaStream | null,
  filter: VideoFilterId,
): MediaStream | null {
  const [output, setOutput] = React.useState<MediaStream | null>(source);
  const filterRef = React.useRef(FILTER_PRESETS[filter].cssFilter);

  React.useEffect(() => {
    filterRef.current = FILTER_PRESETS[filter].cssFilter;
  }, [filter]);

  React.useEffect(() => {
    if (!source || filter === "none" || typeof source.getVideoTracks !== "function") {
      setOutput(source);
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx || typeof canvas.captureStream !== "function") {
      setOutput(source);
      return;
    }

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = source;
    void video.play().catch(() => {});

    let frameId: number;
    const draw = () => {
      if (video.videoWidth && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      if (canvas.width && canvas.height) {
        ctx.filter = filterRef.current;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      frameId = requestAnimationFrame(draw);
    };
    frameId = requestAnimationFrame(draw);

    const canvasStream = canvas.captureStream(30);
    source.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
    setOutput(canvasStream);

    return () => {
      cancelAnimationFrame(frameId);
      // Ne stoppe que la piste vidéo générée par le canvas : les pistes audio
      // ajoutées ci-dessus appartiennent à `source` et sont gérées par son
      // propriétaire (`useCamera`) — les arrêter ici couperait le micro.
      canvasStream.getVideoTracks().forEach((track) => track.stop());
      video.srcObject = null;
    };
  }, [source, filter]);

  return output;
}
