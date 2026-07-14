"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CAPTURE_AUTO, RESOLUTION_PRESETS } from "../constants";
import type { CaptureSettings, ResolutionPreset } from "../types";

interface CaptureSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  settings: CaptureSettings;
  onSettingsChange: (settings: CaptureSettings) => void;
  /** Désactive les réglages (ex. pendant l'enregistrement). */
  disabled?: boolean;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

/**
 * Tiroir de réglages de capture : choix de la caméra, du micro et de la
 * résolution. Composant contrôlé (ouverture pilotée par le Studio).
 */
export function CaptureSettingsSheet({
  open,
  onOpenChange,
  cameras,
  microphones,
  settings,
  onSettingsChange,
  disabled,
}: CaptureSettingsSheetProps) {
  const resolutions = Object.keys(RESOLUTION_PRESETS) as ResolutionPreset[];
  const availableCameras = cameras.filter((device) => device.deviceId);
  const availableMics = microphones.filter((device) => device.deviceId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-sm">
        <SheetHeader className="border-b">
          <SheetTitle>Réglages de capture</SheetTitle>
          <SheetDescription>Choisissez la caméra, le micro et la résolution.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 p-4">
          {disabled && (
            <p className="text-muted-foreground text-sm">
              {"Arrêtez l'enregistrement pour modifier ces réglages."}
            </p>
          )}

          <Field label="Caméra">
            <Select
              disabled={disabled}
              value={settings.videoDeviceId ?? CAPTURE_AUTO}
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  videoDeviceId: value === CAPTURE_AUTO ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Automatique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CAPTURE_AUTO}>Automatique</SelectItem>
                {availableCameras.map((device, index) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Caméra ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Micro">
            <Select
              disabled={disabled}
              value={settings.audioDeviceId ?? CAPTURE_AUTO}
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  audioDeviceId: value === CAPTURE_AUTO ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Automatique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CAPTURE_AUTO}>Automatique</SelectItem>
                {availableMics.map((device, index) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Micro ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Résolution">
            <Select
              disabled={disabled}
              value={settings.resolution}
              onValueChange={(value) =>
                onSettingsChange({ ...settings, resolution: value as ResolutionPreset })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resolutions.map((key) => (
                  <SelectItem key={key} value={key}>
                    {RESOLUTION_PRESETS[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </SheetContent>
    </Sheet>
  );
}
