import Image from "next/image";
import { formatDurationMs } from "~/utils/duration";
import type { Track } from "~/utils/types";
import { CheckmarkBadge } from "~/components/ui/CheckmarkBadge";

interface TrackItemProps {
  track: Track;
  isSelected?: boolean;
  isCurrent?: boolean;
  onClick: () => void;
}

export function TrackItem({
  track,
  isSelected = false,
  isCurrent = false,
  onClick,
}: TrackItemProps) {
  const baseClasses =
    "group glass relative flex cursor-pointer items-center space-x-4 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]";
  const stateClasses = isCurrent
    ? "bg-gradient-to-r from-purple-500/50 to-blue-500/50 ring-2 ring-purple-300 ring-offset-2 ring-offset-slate-900 shadow-xl shadow-purple-500/30 scale-[1.02] border border-purple-300/50"
    : isSelected
      ? "bg-emerald-500/30 ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-emerald-500/20"
      : "hover:bg-white/15 hover:ring-1 hover:ring-white/30";

  return (
    <div className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
      <div className="relative flex-shrink-0">
        {track.album.image && (
          <Image
            src={track.album.image}
            alt={track.album.name}
            width={56}
            height={56}
            className={`h-14 w-14 rounded-xl object-cover shadow-sm transition-all duration-200 ${
              isCurrent
                ? "shadow-lg ring-2 shadow-purple-500/30 ring-purple-300"
                : ""
            }`}
          />
        )}
        {isSelected && (
          <CheckmarkBadge
            color="emerald"
            size="md"
            className="absolute -top-1 -right-1 shadow-sm"
          />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <h4
            className={`truncate text-sm font-medium transition-colors ${
              isCurrent
                ? "font-semibold text-white"
                : isSelected
                  ? "text-emerald-200"
                  : "text-white group-hover:text-purple-300"
            }`}
          >
            {track.name}
          </h4>
          {track.explicit && (
            <span className="inline-flex items-center rounded-md bg-white/20 px-1.5 py-0.5 text-xs font-medium text-gray-300">
              E
            </span>
          )}
        </div>
        <p
          className={`truncate text-xs transition-colors ${
            isCurrent
              ? "text-purple-100"
              : isSelected
                ? "text-gray-300"
                : "text-gray-400 group-hover:text-gray-300"
          }`}
        >
          {track.artists.join(", ")} • {track.album.name}
        </p>
        <p
          className={`text-xs font-medium transition-colors ${
            isCurrent
              ? "text-purple-200"
              : isSelected
                ? "text-gray-400"
                : "text-gray-500 group-hover:text-gray-400"
          }`}
        >
          {formatDurationMs(track.duration_ms)}
        </p>
      </div>

      {isCurrent && (
        <div className="absolute top-1/2 right-4 flex h-8 w-8 -translate-y-1/2 animate-pulse items-center justify-center rounded-full bg-purple-500 shadow-lg">
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
