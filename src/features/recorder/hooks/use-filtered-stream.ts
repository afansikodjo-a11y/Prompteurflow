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
 * Sans filtre ni filigrane, le flux source est retourné tel quel : aucun coût
 * canvas/RAF n'est payé dans le cas courant (rien à graver dans les pixels).
 *
 * @param watermarkText Texte de filigrane (plan Basique) posé en bas à droite,
 * non affecté par le filtre couleur ; `undefined`/vide = pas de filigrane (Standard/Pro).
 */
export function useFilteredStream(
  source: MediaStream | null,
  filter: VideoFilterId,
  watermarkText?: string,
): MediaStream | null {
  const [output, setOutput] = React.useState<MediaStream | null>(source);
  const filterRef = React.useRef(FILTER_PRESETS[filter].cssFilter);

  React.useEffect(() => {
    filterRef.current = FILTER_PRESETS[filter].cssFilter;
  }, [filter]);

  React.useEffect(() => {
    if (
      !source ||
      (filter === "none" && !watermarkText) ||
      typeof source.getVideoTracks !== "function"
    ) {
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
      // `canvas.width`/`height` valent 300×150 par défaut dès sa création,
      // bien avant que la vidéo n'ait une image décodée : les utiliser seuls
      // comme condition laissait passer un premier appel à `drawImage` avant
      // que la vidéo soit prête, qui lève `InvalidStateError` et casse la
      // boucle RAF pour de bon (plus jamais de `requestAnimationFrame`
      // reprogrammé) — le flux capturé restait alors figé sur un cadre vide
      // pendant tout l'enregistrement, d'où un enregistrement tout noir avec
      // l'audio pourtant correct (piste indépendante du canvas). On attend
      // désormais que la vidéo ait réellement une image (`HAVE_CURRENT_DATA`)
      // et on protège l'appel par un try/catch pour que la boucle continue
      // même si un cadre échoue ponctuellement.
      try {
        if (video.videoWidth && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        if (video.readyState >= video.HAVE_CURRENT_DATA && canvas.width && canvas.height) {
          ctx.filter = filterRef.current;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          if (watermarkText) {
            // Filigrane non affecté par le filtre couleur : toujours net/lisible.
            ctx.filter = "none";
            const fontSize = Math.max(12, Math.round(canvas.width * 0.03));
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            ctx.fillText(watermarkText, canvas.width - fontSize * 0.5, canvas.height - fontSize * 0.5);
          }
        }
      } catch {
        // Cadre ignoré — on retente au prochain rAF plutôt que d'arrêter la boucle.
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
  }, [source, filter, watermarkText]);

  return output;
}
