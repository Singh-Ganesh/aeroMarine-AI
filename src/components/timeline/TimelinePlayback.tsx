import type { CSSProperties } from "react";
import { Maximize2, Pause, Play } from "lucide-react";

interface TimelinePlaybackProps {
  progress: number;
  onScrub: (p: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
  speed: number;
  onChangeSpeed: (s: number) => void;
}

const START_SECONDS = 8 * 3600;
const END_SECONDS = 20 * 3600;
const RANGE = END_SECONDS - START_SECONDS;

function secondsToLabel(seconds: number) {
  const h = Math.floor(seconds / 3600) % 24;
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const speeds = [1, 2, 4, 8];
const markers = [8, 12, 16, 20];

export default function TimelinePlayback({
  progress,
  onScrub,
  playing,
  onTogglePlay,
  speed,
  onChangeSpeed,
}: TimelinePlaybackProps) {
  const currentSeconds = START_SECONDS + progress * RANGE;

  return (
    <div className="glass-panel animate-fade-in rounded-xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[13px] font-semibold text-text-primary">Temporal Analysis (Playback)</h2>
        <div className="flex items-center gap-4 text-[11px]">
          <Legend color="bg-text-primary" label="Vessel Positions" />
          <Legend color="bg-red-400" label="Oil Spill Area" />
          <Legend color="bg-amber-400" label="Incident Events" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onTogglePlay}
          aria-label={playing ? "Pause playback" : "Play playback"}
          className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-text-primary text-background shadow-md hover:opacity-90 transition-opacity"
        >
          {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        <div className="leading-tight">
          <p className="text-[12.5px] font-semibold text-text-primary">4 Sep 2026</p>
          <p className="font-mono text-[13px] tabular-nums text-text-primary">{secondsToLabel(currentSeconds)} UTC</p>
        </div>

        <div className="relative min-w-[220px] flex-1">
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(progress * 1000)}
            onChange={(e) => onScrub(Number(e.target.value) / 1000)}
            aria-label="Playback scrubber"
            className="playback-range w-full"
            style={{ "--fill": `${progress * 100}%` } as CSSProperties}
          />
          <div className="pointer-events-none mt-1 flex justify-between text-[10px] text-text-muted">
            {markers.map((h) => (
              <span key={h}>{String(h).padStart(2, "0")}:00</span>
            ))}
          </div>
        </div>

        <select
          value={speed}
          onChange={(e) => onChangeSpeed(Number(e.target.value))}
          aria-label="Playback speed"
          className="focus-ring rounded-lg border border-border bg-surface-hover px-2.5 py-1.5 text-[12px] text-text-primary"
        >
          {speeds.map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>

        <button
          className="focus-ring rounded-lg border border-border p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          aria-label="Expand timeline"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-text-secondary">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
