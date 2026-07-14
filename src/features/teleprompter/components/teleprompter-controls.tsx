"use client";

import { Gauge, Pause, Play, Square, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ControlSlider } from "./control-slider";
import { FONT_SIZE, SPEED } from "../constants";
import type { PlaybackStatus } from "../types";

interface TeleprompterControlsProps {
  status: PlaybackStatus;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  speed: number;
  onSpeedChange: (value: number) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  /** Désactive Lecture/Pause/Stop (ex. pendant un tournage piloté par « Tourner »). */
  disabled?: boolean;
}

/**
 * Barre de contrôle du prompteur : Lecture / Pause / Stop + réglages
 * de vitesse et de taille. Responsive : boutons empilés puis en ligne.
 */
export function TeleprompterControls({
  status,
  isPlaying,
  onPlay,
  onPause,
  onStop,
  speed,
  onSpeedChange,
  fontSize,
  onFontSizeChange,
  disabled,
}: TeleprompterControlsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex items-center justify-center gap-2">
        <Button
          size="icon"
          onClick={onPlay}
          disabled={isPlaying || disabled}
          aria-label="Lecture"
        >
          <Play className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={onPause}
          disabled={!isPlaying || disabled}
          aria-label="Pause"
        >
          <Pause className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={onStop}
          disabled={status === "idle" || disabled}
          aria-label="Stop"
        >
          <Square className="size-4" />
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
        <ControlSlider
          label="Vitesse"
          icon={Gauge}
          value={speed}
          min={SPEED.min}
          max={SPEED.max}
          step={SPEED.step}
          onValueChange={onSpeedChange}
          formatValue={(value) => `${value} mots/min`}
        />
        <ControlSlider
          label="Taille du texte"
          icon={Type}
          value={fontSize}
          min={FONT_SIZE.min}
          max={FONT_SIZE.max}
          step={FONT_SIZE.step}
          onValueChange={onFontSizeChange}
          formatValue={(value) => `${value}px`}
        />
      </div>
    </div>
  );
}
