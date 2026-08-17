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

    // Cadencé par `setInterval`, pas `requestAnimationFrame` : rAF est
    // suspendu (ou fortement bridé) par le navigateur dès que l'onglet perd
    // le premier plan — constaté comme cause d'une image figée en cours
    // d'enregistrement, indépendamment de l'état de l'écran (le wake lock
    // n'empêche pas ce cas) et de la santé de la piste caméra elle-même
    // (aucune erreur, aucun `mute` détectable : c'est notre propre boucle de
    // dessin qui s'arrête, pas la caméra). `setInterval` continue de se
    // déclencher en arrière-plan, quitte à être ralenti par le navigateur —
    // dégradé plutôt que complètement figé jusqu'à la fin de
    // l'enregistrement. Aligné sur `captureStream(CAPTURE_FPS)` ci-dessous.
    const CAPTURE_FPS = 30;
    const FRAME_INTERVAL_MS = 1000 / CAPTURE_FPS;
    const draw = () => {
      // `canvas.width`/`height` valent 300×150 par défaut dès sa création,
      // bien avant que la vidéo n'ait une image décodée : les utiliser seuls
      // comme condition laissait passer un premier appel à `drawImage` avant
      // que la vidéo soit prête, qui lève `InvalidStateError` — protégé par
      // le try/catch pour que la boucle continue même si un cadre échoue
      // ponctuellement. On attend que la vidéo ait réellement une image
      // (`HAVE_CURRENT_DATA`).
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
        // Cadre ignoré — on retente au prochain intervalle plutôt que d'arrêter la boucle.
      }
    };
    const intervalId = window.setInterval(draw, FRAME_INTERVAL_MS);

    const canvasStream = canvas.captureStream(CAPTURE_FPS);
    source.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
    setOutput(canvasStream);

    return () => {
      window.clearInterval(intervalId);
      // Ne stoppe que la piste vidéo générée par le canvas : les pistes audio
      // ajoutées ci-dessus appartiennent à `source` et sont gérées par son
      // propriétaire (`useCamera`) — les arrêter ici couperait le micro.
      canvasStream.getVideoTracks().forEach((track) => track.stop());
      video.srcObject = null;
    };
  }, [source, watermarkText]);

  return output;
}
