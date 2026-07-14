/**
 * API publique de la feature « teleprompter » (texte + défilement).
 */
export { useTeleprompter, type UseTeleprompterResult } from "./hooks/use-teleprompter";
export { usePlaybackShortcuts } from "./hooks/use-playback-shortcuts";
export { PrompterOverlay } from "./components/prompter-overlay";
export { TeleprompterControls } from "./components/teleprompter-controls";
export { ControlSlider } from "./components/control-slider";
export { SPEED, FONT_SIZE, DEFAULT_SCRIPT } from "./constants";
export type { PlaybackStatus, TeleprompterSettings } from "./types";
