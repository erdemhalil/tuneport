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
    if (confidence >= 85) return "text-emerald-900 bg-emerald-100";
    if (confidence >= 70) return "text-lime-900 bg-lime-100";
    if (confidence >= 55) return "text-amber-900 bg-amber-100";
    return "text-rose-900 bg-rose-100";
  };

  const baseClasses =
    "flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors";
  const selectedClasses = isSelected
    ? "border-zinc-900 bg-zinc-100"
    : "border-zinc-300 bg-white hover:bg-zinc-50";

  return (
    <div className={`${baseClasses} ${selectedClasses}`} onClick={onSelect}>
      <div
        className={`${isSelected ? "relative h-20 w-20 shrink-0" : "relative h-16 w-16 shrink-0"}`}
      >
        <Image
          src={match.thumbnail}
          alt={match.title}
          fill
          className={`rounded-lg border object-cover ${isSelected ? "border-zinc-900" : "border-zinc-300"}`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center space-x-2">
          <h4
            className={`truncate text-sm font-medium transition-colors ${isSelected ? "font-semibold text-zinc-900" : "text-zinc-900"}`}
          >
            {match.title}
          </h4>
          {match.explicit && (
            <span className="inline-flex items-center rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600">
              E
            </span>
          )}
          {match.clean && (
            <span className="inline-flex items-center rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600">
              C
            </span>
          )}
        </div>
        <p className="truncate text-xs text-zinc-500">{match.channel}</p>
        <div className="mt-1 flex items-center space-x-2">
          <span
            className={`text-xs ${isSelected ? "text-zinc-700" : "text-zinc-500"}`}
          >
            {formatDuration(match.duration)}
          </span>
          {match.viewCount != null && (
            <span
              className={`text-xs ${isSelected ? "text-zinc-700" : "text-zinc-500"}`}
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
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 hover:text-red-800 focus:ring-2 focus:ring-red-300 focus:outline-none"
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
