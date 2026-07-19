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

    // Compresseur : resserre l'écart entre passages forts et faibles (comme
    // le fait la plupart des applis caméra), puis un gain fixe pour relever
    // le niveau global. Un compresseur seul ne garantit pas un plafond strict
    // (une entrée déjà forte + ce gain peut dépasser l'amplitude max et
    // écrêter — mesuré en test : pic à 1.096 sans limiteur, du son distordu,
    // pire que trop faible) — d'où le limiteur final en filet de sécurité.
    const source = audioContext.createMediaStreamSource(new MediaStream(stream.getAudioTracks()));
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.25;
    const makeupGain = audioContext.createGain();
    makeupGain.gain.value = 1.4;
    // Limiteur : quasi brick-wall, garantit qu'aucun pic ne dépasse ~-3 dB
    // (≈ 0.7 en amplitude) quel que soit le niveau d'entrée ou le gain ci-dessus.
    const limiter = audioContext.createDynamicsCompressor();
    limiter.threshold.value = -3;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.1;
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
      // (`useCamera`) — même précaution que pour le filtre vidéo (voir
      // `use-filtered-stream.ts`).
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
