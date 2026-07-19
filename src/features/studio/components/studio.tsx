"use client";

import * as React from "react";
import {
  Check,
  Clapperboard,
  Download,
  FlipHorizontal2,
  Maximize2,
  Minimize2,
  Pause,
  Pencil,
  Play,
  Settings,
  Square,
  SwitchCamera,
  Video,
  VideoOff,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteConfig } from "@/config/site";
import { useCountdown } from "@/hooks/use-countdown";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  CameraPreview,
  CaptureSettingsSheet,
  DEFAULT_CAPTURE_SETTINGS,
  DEFAULT_VIDEO_FILTER,
  FilterStrip,
  formatDuration,
  useBoostedAudio,
  useCamera,
  useFilteredStream,
  useMediaDevices,
  useRecorder,
  type CaptureSettings,
  type VideoFilterId,
} from "@/features/recorder";
import { RecordingsLibrary, useRecordings } from "@/features/recordings";
import { ScriptsLibrary, useScripts } from "@/features/scripts";
import { useSubscription } from "@/features/subscription";
import {
  DEFAULT_SCRIPT,
  PrompterOverlay,
  SPEED,
  TeleprompterControls,
  usePlaybackShortcuts,
  useTeleprompter,
} from "@/features/teleprompter";

/** Raison de la relance d'upgrade affichée à l'utilisateur (plan Basique). */
type UpgradeReason = "filter" | "scripts" | "duration" | "import" | null;

const UPGRADE_MESSAGES: Record<Exclude<UpgradeReason, null>, { title: string; description: string }> = {
  filter: {
    title: "Filtre réservé au plan Standard",
    description: "Passez au plan Standard pour débloquer tous les filtres de style.",
  },
  scripts: {
    title: "Limite de scripts atteinte",
    description: "Le plan Basique est limité à quelques scripts sauvegardés. Passez au plan Standard pour un nombre illimité.",
  },
  duration: {
    title: "Durée maximale atteinte",
    description: "Le plan Basique limite la durée d'un enregistrement. Passez au plan Standard pour enregistrer sans limite.",
  },
  import: {
    title: "Import de script réservé au plan Standard",
    description: "Passez au plan Standard pour importer un script depuis un fichier .txt.",
  },
};

/** Bouton d'action translucide posé sur la scène vidéo (fond sombre). */
function StageButton({
  onClick,
  label,
  active,
  disabled,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
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

/** Action principale : Tourner → (décompte) → Annuler → Arrêter. */
function RollButton({
  state,
  disabled,
  onRoll,
  onCancel,
  onStop,
}: {
  state: "idle" | "counting" | "rolling";
  disabled?: boolean;
  onRoll: () => void;
  onCancel: () => void;
  onStop: () => void;
}) {
  if (state === "counting") {
    return (
      <Button type="button" variant="secondary" onClick={onCancel} className="gap-2">
        <X className="size-4" />
        Annuler
      </Button>
    );
  }
  if (state === "rolling") {
    return (
      <Button
        type="button"
        onClick={onStop}
        className="gap-2 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/40"
      >
        <Square className="size-3.5 fill-current" />
        Arrêter
      </Button>
    );
  }
  return (
    <Button
      type="button"
      onClick={onRoll}
      disabled={disabled}
      className="gap-2 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/40"
    >
      <Clapperboard className="size-4" />
      Tourner
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
  const { plan } = useSubscription();
  const [upgradeReason, setUpgradeReason] = React.useState<UpgradeReason>(null);
  const scriptsState = useScripts(DEFAULT_SCRIPT, plan.maxScripts ?? undefined);
  const { currentScript } = scriptsState;
  const [mirrored, setMirrored] = useLocalStorage("prompteurflow:mirrored", false);
  const [capture, setCapture] = useLocalStorage<CaptureSettings>(
    "prompteurflow:capture",
    DEFAULT_CAPTURE_SETTINGS,
  );
  const [filter, setFilter] = useLocalStorage<VideoFilterId>(
    "prompteurflow:filter",
    DEFAULT_VIDEO_FILTER,
  );
  // Éteinte, la caméra (et le micro) est réellement libérée côté matériel —
  // pas juste masquée — pour une lecture plein écran fond noir sans caméra.
  const [cameraEnabled, setCameraEnabled] = useLocalStorage("prompteurflow:camera-enabled", true);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const { cameras, microphones, refresh: refreshDevices } = useMediaDevices();
  const camera = useCamera(capture, cameraEnabled);
  // Amplifie la piste audio (Web Audio) avant tout le reste du pipeline :
  // nécessaire notamment sur Safari/iOS, qui ne respecte pas de façon
  // fiable les contraintes getUserMedia désactivant l'AGC (voir
  // `use-camera.ts`) — Android/Chrome les honore correctement, iOS non.
  const boostedAudio = useBoostedAudio(camera.stream);
  // `captureActive` borne la fenêtre où le filigrane est gravé (décompte →
  // fin d'enregistrement) : le pipeline canvas est coûteux (dessin de chaque
  // frame + ré-encodage), on évite de le faire tourner en continu pendant le
  // simple cadrage/aperçu, sans quoi c'est le pipeline par défaut du plan
  // Basique en permanence dès que la caméra est allumée — constaté comme
  // cause probable de surchauffe/décharge batterie rapide sur téléphone. Le
  // filtre couleur, lui, reste gravé en aperçu en continu (WYSIWYG voulu).
  const [captureActive, setCaptureActive] = React.useState(false);
  // Le filtre (et le filigrane du plan Basique, seulement pendant la capture)
  // sont gravés dans les pixels ici, en amont de l'aperçu ET de
  // l'enregistrement, pour que les deux montrent/capturent le même rendu.
  const filteredStream = useFilteredStream(
    boostedAudio.stream,
    filter,
    plan.watermark && captureActive ? siteConfig.name : undefined,
  );
  const recordings = useRecordings();
  const recorder = useRecorder(filteredStream, {
    onComplete: (blob, durationSec) => {
      void recordings.add(blob, durationSec);
      setCaptureActive(false);
    },
    maxDurationSec: plan.maxDurationSec ?? undefined,
  });
  const prompter = useTeleprompter();
  const { ref: containerRef, isFullscreen, toggle: toggleFullscreen } = useFullscreen<HTMLDivElement>();
  const countdown = useCountdown();

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

  const toggleEditing = () => {
    setEditing((value) => {
      if (!value) prompter.stop(); // entrer en édition arrête tout défilement
      return !value;
    });
  };

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
  const rollState = countdown.isCounting ? "counting" : isRecording ? "rolling" : "idle";

  const handleTextChange = (value: string) => {
    if (currentScript) scriptsState.updateContent(currentScript.id, value);
  };

  const handleCreateScript = () => {
    if (scriptsState.create() === null) setUpgradeReason("scripts");
  };

  const handleImportScript = async (file: File) => {
    const content = await file.text();
    const title = file.name.replace(/\.[^/.]+$/, "");
    if (scriptsState.create({ title, content }) === null) setUpgradeReason("scripts");
  };

  // « Tourner » : décompte, puis enregistrement + défilement synchronisés.
  // `captureActive` passe à `true` dès le décompte (pas seulement au démarrage
  // effectif de l'enregistrement) pour laisser le pipeline canvas quelques
  // secondes de marge avant que `recorder.start()` n'ait besoin de vraies
  // frames — évite de retomber dans la course déjà corrigée sur l'écran noir.
  const handleRoll = () => {
    setEditing(false);
    setSettingsOpen(false);
    // Appel direct dans la pile du clic : sur iOS Safari, c'est la seule
    // façon fiable d'activer l'AudioContext du boost audio (voir
    // `use-boosted-audio.ts`) — sans ça, le contexte peut rester suspendu
    // en silence selon le timing, d'où un volume qui « ne marche pas
    // toujours » constaté sur iPhone.
    boostedAudio.resume();
    prompter.stop(); // repart du début du script
    setCaptureActive(true);
    countdown.start(3, () => {
      recorder.start();
      prompter.play();
    });
  };

  const handleStopRoll = () => {
    countdown.cancel();
    recorder.stop();
    prompter.stop();
    setCaptureActive(false);
  };

  // Pause pendant le tournage : suspend enregistrement ET défilement ensemble.
  const handleTogglePauseRoll = () => {
    if (recorder.status === "recording") {
      recorder.pause();
      prompter.pause();
    } else if (recorder.status === "paused") {
      recorder.resume();
      prompter.play();
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-background flex h-[calc(100dvh-3.5rem)] flex-col [&:fullscreen]:h-dvh short-landscape:flex-row"
    >
      {/* Scène : aperçu caméra + texte en overlay */}
      <div className="relative flex-1 overflow-hidden bg-neutral-950">
        {cameraEnabled && (
          <CameraPreview
            stream={filteredStream}
            status={camera.status}
            mirrored={capture.facingMode === "user"}
            onRetry={camera.start}
          />
        )}
        <PrompterOverlay
          ref={prompter.scrollRef}
          value={currentScript?.content ?? ""}
          onChange={handleTextChange}
          fontSize={prompter.fontSize}
          readOnly={!editing || !currentScript}
          mirrored={mirrored}
          editing={editing}
        />

        {!isRecording && !countdown.isCounting && (
          <button
            type="button"
            onClick={toggleEditing}
            className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/70"
          >
            {editing ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
            {editing ? "Terminé" : "Éditer"}
          </button>
        )}

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

        {/* Masqués pendant le décompte/tournage — inutilisables à ce moment
            (désactivés) et n'occupaient de l'espace que pour rien : même
            logique que la bande de filtres ci-dessous, pour laisser toute
            la scène au texte pendant la prise. */}
        {!isRecording && !countdown.isCounting && (
          <div className="absolute top-3 right-3 z-20 flex gap-2">
            <StageButton
              onClick={() => setCameraEnabled((value) => !value)}
              label={cameraEnabled ? "Éteindre la caméra" : "Activer la caméra"}
              active={!cameraEnabled}
            >
              {cameraEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
            </StageButton>
            <StageButton
              onClick={() => setMirrored((value) => !value)}
              label="Mode miroir"
              active={mirrored}
            >
              <FlipHorizontal2 className="size-4" />
            </StageButton>
            {cameraEnabled && (
              <>
                <StageButton onClick={handleSwitchCamera} label="Changer de caméra">
                  <SwitchCamera className="size-4" />
                </StageButton>
                <StageButton onClick={() => setSettingsOpen(true)} label="Réglages de capture">
                  <Settings className="size-4" />
                </StageButton>
              </>
            )}
            <StageButton
              onClick={() => void toggleFullscreen()}
              label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </StageButton>
          </div>
        )}

        {cameraEnabled && !isRecording && !countdown.isCounting && (
          <FilterStrip
            value={filter}
            onChange={setFilter}
            unlockedFilters={plan.unlockedFilters}
            onLockedSelect={() => setUpgradeReason("filter")}
            className="absolute top-14 inset-x-3 z-20"
          />
        )}

        {countdown.count !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span
              key={countdown.count}
              className="animate-in zoom-in-50 fade-in text-[7rem] font-bold tabular-nums text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] duration-300"
            >
              {countdown.count}
            </span>
          </div>
        )}
      </div>

      {/* Barre de contrôles — en bas (portrait), sur le côté droit (paysage court) */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 shrink-0 border-t backdrop-blur short-landscape:w-80 short-landscape:overflow-y-auto short-landscape:border-t-0 short-landscape:border-l">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4">
          <div
            className={cn(
              "flex flex-wrap items-center gap-3",
              isRecording || countdown.isCounting ? "justify-center" : "justify-between",
            )}
          >
            {/* Masqué pendant le décompte/tournage : inutile en pleine prise,
                et sa disparition laisse la barre du bas rétrécir pour rendre
                plus d'espace vertical à la scène (même logique que les
                boutons masqués ci-dessus). */}
            {!isRecording && !countdown.isCounting && (
              <div className="flex flex-wrap items-center gap-2">
                <ScriptsLibrary
                  scripts={scriptsState.scripts}
                  currentId={scriptsState.currentId}
                  currentTitle={currentScript?.title ?? "Sans titre"}
                  onSelect={scriptsState.select}
                  onCreate={handleCreateScript}
                  onRename={scriptsState.rename}
                  onRemove={scriptsState.remove}
                  canImport={plan.scriptImport}
                  onImport={(file) => void handleImportScript(file)}
                  onImportLocked={() => setUpgradeReason("import")}
                />
                <RecordingsLibrary
                  recordings={recordings.recordings}
                  getObjectUrl={recordings.getObjectUrl}
                  onRemove={recordings.remove}
                />
              </div>
            )}
            {cameraEnabled && (
              <div className="flex items-center gap-2">
                <RollButton
                  state={rollState}
                  disabled={!filteredStream || !recorder.isSupported}
                  onRoll={handleRoll}
                  onCancel={countdown.cancel}
                  onStop={handleStopRoll}
                />
                {rollState === "rolling" && (
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleTogglePauseRoll}
                    aria-label={recorder.status === "recording" ? "Suspendre" : "Reprendre"}
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
            )}
          </div>

          {rollState === "idle" && (
            <TeleprompterControls
              status={prompter.status}
              isPlaying={prompter.isPlaying}
              onPlay={() => {
                setEditing(false);
                prompter.play();
              }}
              onPause={prompter.pause}
              onStop={prompter.stop}
              speed={prompter.speed}
              onSpeedChange={prompter.setSpeed}
              fontSize={prompter.fontSize}
              onFontSizeChange={prompter.setFontSize}
            />
          )}
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

      <Dialog open={upgradeReason !== null} onOpenChange={(open) => !open && setUpgradeReason(null)}>
        <DialogContent>
          {upgradeReason && (
            <>
              <DialogHeader>
                <DialogTitle>{UPGRADE_MESSAGES[upgradeReason].title}</DialogTitle>
                <DialogDescription>{UPGRADE_MESSAGES[upgradeReason].description}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setUpgradeReason(null)}>Compris</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
