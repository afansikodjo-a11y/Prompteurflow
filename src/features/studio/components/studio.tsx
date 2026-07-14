"use client";

import * as React from "react";
import {
  Download,
  FlipHorizontal2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Settings,
  SwitchCamera,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  CameraPreview,
  CaptureSettingsSheet,
  DEFAULT_CAPTURE_SETTINGS,
  RecordButton,
  formatDuration,
  useCamera,
  useMediaDevices,
  useRecorder,
  type CaptureSettings,
} from "@/features/recorder";
import { RecordingsLibrary, useRecordings } from "@/features/recordings";
import { ScriptsLibrary, useScripts } from "@/features/scripts";
import {
  DEFAULT_SCRIPT,
  PrompterOverlay,
  SPEED,
  TeleprompterControls,
  usePlaybackShortcuts,
  useTeleprompter,
} from "@/features/teleprompter";

/** Bouton d'action translucide posé sur la scène vidéo (fond sombre). */
function StageButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "size-9 rounded-full text-white backdrop-blur hover:bg-black/60 hover:text-white",
        active ? "bg-white/25" : "bg-black/40",
      )}
    >
      {children}
    </Button>
  );
}

/**
 * Écran principal de PrompteurFlow.
 *
 * Compose deux features indépendantes :
 * - `recorder` : aperçu caméra plein cadre + enregistrement vidéo ;
 * - `teleprompter` : texte défilant superposé + contrôles de lecture.
 *
 * La scène (zone vidéo) est volontairement sombre — c'est un plateau —
 * tandis que la barre de contrôles reste fidèle au thème (clair/sombre).
 */
export function Studio() {
  const scriptsState = useScripts(DEFAULT_SCRIPT);
  const { currentScript } = scriptsState;
  const [mirrored, setMirrored] = useLocalStorage("prompteurflow:mirrored", false);
  const [capture, setCapture] = useLocalStorage<CaptureSettings>(
    "prompteurflow:capture",
    DEFAULT_CAPTURE_SETTINGS,
  );
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const { cameras, microphones, refresh: refreshDevices } = useMediaDevices();
  const camera = useCamera(capture);
  const recordings = useRecordings();
  const recorder = useRecorder(camera.stream, {
    onComplete: (blob, durationSec) => void recordings.add(blob, durationSec),
  });
  const prompter = useTeleprompter();
  const { ref: containerRef, isFullscreen, toggle: toggleFullscreen } = useFullscreen<HTMLDivElement>();

  // Rafraîchit la liste des périphériques une fois la permission accordée
  // (les labels ne sont renseignés qu'à ce moment-là).
  React.useEffect(() => {
    if (camera.status === "ready") void refreshDevices();
  }, [camera.status, refreshDevices]);

  const handleSwitchCamera = React.useCallback(() => {
    setCapture((current) => ({
      ...current,
      facingMode: current.facingMode === "user" ? "environment" : "user",
      videoDeviceId: undefined,
    }));
  }, [setCapture]);

  usePlaybackShortcuts({
    isPlaying: prompter.isPlaying,
    play: prompter.play,
    pause: prompter.pause,
    stop: prompter.stop,
    adjustSpeed: prompter.adjustSpeed,
    speedStep: SPEED.step,
  });

  const isRecording = recorder.status !== "idle";
  const hasClip = Boolean(recorder.recordingUrl) && !isRecording;

  const handleTextChange = (value: string) => {
    if (currentScript) scriptsState.updateContent(currentScript.id, value);
  };

  return (
    <div
      ref={containerRef}
      className="bg-background flex h-[calc(100dvh-3.5rem)] flex-col [&:fullscreen]:h-dvh"
    >
      {/* Scène : aperçu caméra + texte en overlay */}
      <div className="relative flex-1 overflow-hidden bg-neutral-950">
        <CameraPreview
          stream={camera.stream}
          status={camera.status}
          mirrored={capture.facingMode === "user"}
          onRetry={camera.start}
        />
        <PrompterOverlay
          ref={prompter.scrollRef}
          value={currentScript?.content ?? ""}
          onChange={handleTextChange}
          fontSize={prompter.fontSize}
          readOnly={prompter.status !== "idle" || !currentScript}
          mirrored={mirrored}
        />

        {isRecording && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
            <span
              className={cn(
                "size-2 rounded-full bg-red-500",
                recorder.status === "recording" && "animate-pulse",
              )}
            />
            {recorder.status === "paused" ? "PAUSE" : "REC"}{" "}
            <span className="tabular-nums">{formatDuration(recorder.elapsed)}</span>
          </div>
        )}

        <div className="absolute top-3 right-3 z-20 flex gap-2">
          <StageButton
            onClick={() => setMirrored((value) => !value)}
            label="Mode miroir"
            active={mirrored}
          >
            <FlipHorizontal2 className="size-4" />
          </StageButton>
          <StageButton onClick={handleSwitchCamera} label="Changer de caméra">
            <SwitchCamera className="size-4" />
          </StageButton>
          <StageButton onClick={() => setSettingsOpen(true)} label="Réglages de capture">
            <Settings className="size-4" />
          </StageButton>
          <StageButton
            onClick={() => void toggleFullscreen()}
            label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </StageButton>
        </div>
      </div>

      {/* Barre de contrôles */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 shrink-0 border-t backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <ScriptsLibrary
                scripts={scriptsState.scripts}
                currentId={scriptsState.currentId}
                currentTitle={currentScript?.title ?? "Sans titre"}
                onSelect={scriptsState.select}
                onCreate={scriptsState.create}
                onRename={scriptsState.rename}
                onRemove={scriptsState.remove}
              />
              <RecordingsLibrary
                recordings={recordings.recordings}
                getObjectUrl={recordings.getObjectUrl}
                onRemove={recordings.remove}
              />
            </div>
            <div className="flex items-center gap-2">
              <RecordButton
                status={recorder.status}
                elapsed={recorder.elapsed}
                disabled={!camera.stream || !recorder.isSupported}
                onStart={recorder.start}
                onStop={recorder.stop}
              />
              {isRecording && (
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={recorder.status === "recording" ? recorder.pause : recorder.resume}
                  aria-label={
                    recorder.status === "recording"
                      ? "Suspendre l'enregistrement"
                      : "Reprendre l'enregistrement"
                  }
                >
                  {recorder.status === "recording" ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </Button>
              )}
              {hasClip && recorder.recordingUrl && (
                <Button asChild variant="outline">
                  <a href={recorder.recordingUrl} download={`prompteurflow-${Date.now()}.webm`}>
                    <Download className="size-4" />
                    Télécharger
                  </a>
                </Button>
              )}
            </div>
          </div>

          <TeleprompterControls
            status={prompter.status}
            isPlaying={prompter.isPlaying}
            onPlay={prompter.play}
            onPause={prompter.pause}
            onStop={prompter.stop}
            speed={prompter.speed}
            onSpeedChange={prompter.setSpeed}
            fontSize={prompter.fontSize}
            onFontSizeChange={prompter.setFontSize}
          />
        </div>
      </div>

      <CaptureSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        cameras={cameras}
        microphones={microphones}
        settings={capture}
        onSettingsChange={setCapture}
        disabled={isRecording}
      />
    </div>
  );
}
