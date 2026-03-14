import Image from "next/image";
import type { YouTubeSearchResult } from "~/utils/types";
import { formatDuration } from "~/utils/duration";
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
    if (confidence >= 80) return "text-emerald-400 bg-emerald-500/20";
    if (confidence >= 60) return "text-yellow-400 bg-yellow-500/20";
    return "text-red-400 bg-red-500/20";
  };

  const baseClasses =
    "flex cursor-pointer items-center space-x-3 rounded-xl border p-3 transition-all duration-200";
  const selectedClasses = isSelected
    ? "border-purple-400 bg-gradient-to-r from-purple-500/40 to-blue-500/30 ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900 shadow-xl scale-[1.02]"
    : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10";

  return (
    <div className={`${baseClasses} ${selectedClasses}`} onClick={onSelect}>
      <div
        className={`${isSelected ? "relative h-20 w-20 flex-shrink-0" : "relative h-16 w-16 flex-shrink-0"}`}
      >
        <Image
          src={match.thumbnail}
          alt={match.title}
          fill
          className={`rounded-lg object-cover transition-all duration-200 ${isSelected ? "shadow-lg ring-2 ring-purple-300" : ""}`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center space-x-2">
          <h4
            className={`truncate text-sm font-medium transition-colors ${isSelected ? "font-semibold text-white" : "text-white"}`}
          >
            {match.title}
          </h4>
          {match.explicit && (
            <span className="inline-flex items-center rounded bg-red-500/20 px-1.5 py-0.5 text-xs font-medium text-red-400">
              E
            </span>
          )}
          {match.clean && (
            <span className="inline-flex items-center rounded bg-blue-500/20 px-1.5 py-0.5 text-xs font-medium text-blue-400">
              C
            </span>
          )}
        </div>
        <p className="truncate text-xs text-gray-400">{match.channel}</p>
        <div className="mt-1 flex items-center space-x-2">
          <span
            className={`text-xs ${isSelected ? "text-purple-200" : "text-gray-500"}`}
          >
            {formatDuration(match.duration)}
          </span>
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
          className="p-1 text-gray-400 transition-colors hover:text-white"
          title="Preview on YouTube"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        {isSelected && <CheckmarkBadge color="purple" size="sm" />}
      </div>
    </div>
  );
}
