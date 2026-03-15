import Image from "next/image";
import type { YouTubeSearchResult } from "~/utils/types";
import { formatDuration } from "~/utils/duration";
import { formatCompactNumber } from "~/utils/format";
import { CheckmarkBadge } from "~/components/ui/CheckmarkBadge";

interface MatchItemProps {
  match: YouTubeSearchResult;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

export function MatchItem({
  match,
  isSelected,
  onSelect,
  onPreview,
}: MatchItemProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-emerald-500 bg-emerald-500/15";
    if (confidence >= 70) return "text-lime-500 bg-lime-500/15";
    if (confidence >= 55) return "text-amber-500 bg-amber-500/15";
    return "text-rose-500 bg-rose-500/15";
  };

  const baseClasses =
    "flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors";
  const selectedClasses = isSelected
    ? "border-edge-strong bg-surface-hover"
    : "border-edge bg-surface hover:bg-surface-hover";

  return (
    <div className={`${baseClasses} ${selectedClasses}`} onClick={onSelect}>
      <div
        className={`${isSelected ? "relative h-20 w-20 shrink-0" : "relative h-16 w-16 shrink-0"}`}
      >
        <Image
          src={match.thumbnail}
          alt={match.title}
          fill
          className={`rounded-lg border object-cover ${isSelected ? "border-edge-strong" : "border-edge"}`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center space-x-2">
          <h4
            className={`text-primary truncate text-sm font-medium transition-colors ${isSelected ? "font-semibold" : ""}`}
          >
            {match.title}
          </h4>
          {match.explicit && (
            <span className="border-edge bg-inset text-secondary inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium">
              E
            </span>
          )}
          {match.clean && (
            <span className="border-edge bg-inset text-secondary inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium">
              C
            </span>
          )}
        </div>
        <p className="text-secondary truncate text-xs">{match.channel}</p>
        <div className="mt-1 flex items-center space-x-2">
          <span
            className={`text-xs ${isSelected ? "text-secondary" : "text-muted"}`}
          >
            {formatDuration(match.duration)}
          </span>
          {match.viewCount != null && (
            <span
              className={`text-xs ${isSelected ? "text-secondary" : "text-muted"}`}
            >
              {formatCompactNumber(match.viewCount)} views
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getConfidenceColor(match.confidence)}`}
          >
            {Math.round(match.confidence)}% match
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-500/20 bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20 hover:text-red-400 focus:ring-2 focus:ring-red-500/30 focus:outline-none"
          title="Preview on YouTube"
          aria-label="Open this track preview on YouTube"
        >
          <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        {isSelected && <CheckmarkBadge color="emerald" size="sm" />}
      </div>
    </div>
  );
}
