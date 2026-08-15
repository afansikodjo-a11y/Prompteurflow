"use client";

import * as React from "react";

/**
 * Grave un filigrane texte dans les pixels d'un flux caméra, via un pipeline
 * canvas.
 *
 * C'est nécessaire pour que le filigrane apparaisse dans l'enregistrement
 * final : `MediaRecorder` capture les pixels du flux qu'on lui donne, pas un
 * texte superposé dans le DOM par-dessus un `<video>` de preview, qui ne
 * ressortirait jamais dans le fichier exporté.
 *
 * Sans filigrane, le flux source est retourné tel quel : aucun coût
 * canvas/RAF n'est payé dans le cas courant (rien à graver dans les pixels)
 * — c'est aussi ce qui donne aux comptes payants (jamais de filigrane) un
 * enregistrement capté directement, sans passer par ce pipeline.
 *
 * @param watermarkText Texte de filigrane (plan Basique) posé en bas à droite ; `undefined`/vide = pas de filigrane (Pro).
 */
export function useWatermarkedStream(
  source: MediaStream | null,
  watermarkText?: string,
): MediaStream | null {
  const [output, setOutput] = React.useState<MediaStream | null>(source);

  React.useEffect(() => {
    if (!source || !watermarkText || typeof source.getVideoTracks !== "function") {
      setOutput(source);
      return;
    }

    const canvas = document.createElement("canvas");
    // `alpha: false` : une image caméra est toujours pleinement opaque, ce
    // qui évite au navigateur de suivre/composer un canal alpha à chaque
    // `drawImage` — gain mesurable sur mobile, gratuit ici.
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx || typeof canvas.captureStream !== "function") {
      setOutput(source);
      return;
    }

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = source;
    void video.play().catch(() => {});

    // Aligné sur `captureStream(CAPTURE_FPS)` ci-dessous : dessiner plus
    // souvent que ce que le flux capturé retient ne sert à rien. Sans ce
    // throttle, la boucle tournait à la fréquence native de l'écran (60Hz+
    // sur la plupart des téléphones), doublant inutilement le coût de
    // `drawImage` pleine résolution — constaté comme cause de saccades
    // vidéo (l'audio, capté hors canvas, restait fluide) dès que le
    // filigrane engageait ce pipeline.
    const CAPTURE_FPS = 30;
    const FRAME_INTERVAL_MS = 1000 / CAPTURE_FPS;
    let lastDrawTime = 0;
    let frameId: number;
    const draw = (timestamp: number) => {
      frameId = requestAnimationFrame(draw);
      if (timestamp - lastDrawTime < FRAME_INTERVAL_MS) return;
      lastDrawTime = timestamp;

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
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const fontSize = Math.max(12, Math.round(canvas.width * 0.03));
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.textAlign = "right";
          ctx.textBaseline = "bottom";
          ctx.fillText(watermarkText, canvas.width - fontSize * 0.5, canvas.height - fontSize * 0.5);
        }
      } catch {
        // Cadre ignoré — on retente au prochain rAF plutôt que d'arrêter la boucle.
      }
    };
    frameId = requestAnimationFrame(draw);

    const canvasStream = canvas.captureStream(CAPTURE_FPS);
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
  }, [source, watermarkText]);

  return output;
}
