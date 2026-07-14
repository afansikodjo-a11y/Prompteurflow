/**
 * API publique de la feature « recorder » (caméra + enregistrement).
 */
export { useCamera, type UseCameraResult } from "./hooks/use-camera";
export { useRecorder, type UseRecorderResult } from "./hooks/use-recorder";
export { useMediaDevices, type UseMediaDevicesResult } from "./hooks/use-media-devices";
export { CameraPreview } from "./components/camera-preview";
export { RecordButton } from "./components/record-button";
export { CaptureSettingsSheet } from "./components/capture-settings-sheet";
export { formatDuration } from "./utils";
export { DEFAULT_CAPTURE_SETTINGS } from "./constants";
export type {
  CameraStatus,
  RecorderStatus,
  FacingMode,
  CaptureSettings,
  ResolutionPreset,
} from "./types";
