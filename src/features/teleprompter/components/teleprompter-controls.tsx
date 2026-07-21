"use client";

import { Gauge, Minus, Pause, Play, Plus, Square, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
        <div className="flex flex-col gap-1.5">
          <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Gauge className="size-3.5" />
              Vitesse
            </span>
            <span className="tabular-nums">{speed} mots/min</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-7 shrink-0"
              onClick={() => onSpeedChange(Math.max(SPEED.min, speed - SPEED.step))}
              disabled={speed <= SPEED.min}
              aria-label="Ralentir"
            >
              <Minus className="size-3.5" />
            </Button>
            <Slider
              value={[speed]}
              min={SPEED.min}
              max={SPEED.max}
              step={SPEED.step}
              onValueChange={(values) => onSpeedChange(values[0] ?? speed)}
              aria-label="Vitesse"
              className="flex-1"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-7 shrink-0"
              onClick={() => onSpeedChange(Math.min(SPEED.max, speed + SPEED.step))}
              disabled={speed >= SPEED.max}
              aria-label="Accélérer"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        </div>
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
