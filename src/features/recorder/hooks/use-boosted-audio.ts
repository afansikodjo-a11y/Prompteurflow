"use client";

import * as React from "react";

/**
 * Amplifie la piste audio d'un flux caméra via un compresseur + un gain de
 * rattrapage (Web Audio API), pour un volume plus proche d'une appli caméra
 * native.
 *
 * Complète les contraintes `getUserMedia` (echoCancellation/noiseSuppression/
 * autoGainControl à `false`, voir `use-camera.ts`) : Safari/iOS ne les
 * respecte pas de façon fiable — contrairement à Android/Chrome, il continue
 * d'appliquer son propre traitement vocal en coulisses quoi qu'on demande.
 * Ce boost, lui, agit directement sur les échantillons audio : son effet ne
 * dépend d'aucun réglage honoré (ou non) par le navigateur, donc identique
 * sur toutes les plateformes.
 */
export interface UseBoostedAudioResult {
  stream: MediaStream | null;
  /**
   * Relance l'`AudioContext` — à appeler depuis un geste utilisateur direct
   * (ex. le clic sur « Tourner »). Le `resume()` automatique ci-dessous, à
   * la création du flux caméra, ne suffit pas toujours sur iOS Safari : il
   * n'active l'AudioContext de façon fiable que s'il est appelé dans la
   * pile d'un vrai geste, pas dans un effet qui réagit à un changement
   * d'état asynchrone — d'où le volume qui « ne marche pas toujours »
   * constaté sur iPhone (le contexte reste parfois suspendu en silence).
   */
  resume: () => void;
}

export function useBoostedAudio(stream: MediaStream | null): UseBoostedAudioResult {
  const [output, setOutput] = React.useState<MediaStream | null>(stream);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  React.useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0 || typeof AudioContext === "undefined") {
      setOutput(stream);
      return;
    }

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    void audioContext.resume().catch(() => {});

    // Compresseur : seuil bas (-40 dB) pour agir sur quasi tout le signal
    // vocal, pas seulement les pics forts — un micro qui capte globalement
    // bas (typique iPhone selon la distance/orientation) reste sinon
    // inchangé sous le seuil. Ratio et gain de rattrapage assouplis (vs un
    // premier réglage à 6:1/×3.2) : signalé comme sonnant plus "poussé"/
    // moins naturel qu'une appli caméra native — la version précédente
    // corrigeait le volume trop faible au prix d'un son sur-compressé
    // (bruit de fond remonté avec la voix, respiration audible du
    // compresseur). Toujours à vérifier en conditions réelles : un réglage
    // trop doux referait resurgir le problème initial (trop faible sur
    // iPhone) que ce chantier a résolu.
    const source = audioContext.createMediaStreamSource(new MediaStream(stream.getAudioTracks()));
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -40;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.15;
    const makeupGain = audioContext.createGain();
    makeupGain.gain.value = 2.5;
    // Limiteur : quasi brick-wall, garantit qu'aucun pic ne dépasse ~-1 dB
    // (≈ 0.9 en amplitude) quel que soit le niveau d'entrée ou le gain ci-dessus.
    const limiter = audioContext.createDynamicsCompressor();
    limiter.threshold.value = -1;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.08;
    const destination = audioContext.createMediaStreamDestination();

    source.connect(compressor);
    compressor.connect(makeupGain);
    makeupGain.connect(limiter);
    limiter.connect(destination);

    setOutput(
      new MediaStream([...stream.getVideoTracks(), ...destination.stream.getAudioTracks()]),
    );

    return () => {
      source.disconnect();
      compressor.disconnect();
      makeupGain.disconnect();
      limiter.disconnect();
      // Ne stoppe que la piste audio générée par le graphe Web Audio : la
      // piste vidéo appartient à `stream`, gérée par son propriétaire
      // (`useCamera`) — même précaution que pour le filigrane vidéo (voir
      // `use-watermarked-stream.ts`).
      destination.stream.getAudioTracks().forEach((track) => track.stop());
      void audioContext.close().catch(() => {});
      audioContextRef.current = null;
    };
  }, [stream]);

  const resume = React.useCallback(() => {
    void audioContextRef.current?.resume().catch(() => {});
  }, []);

  return { stream: output, resume };
}
