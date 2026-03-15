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
    "group relative flex cursor-pointer items-center space-x-4 rounded-xl border border-zinc-300 bg-white p-4 transition-colors";
  const stateClasses = isCurrent
    ? "border-zinc-900 bg-zinc-100"
    : isSelected
      ? "border-zinc-500 bg-zinc-50"
      : "hover:bg-zinc-50";

  return (
    <div className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
      <div className="relative shrink-0">
        {track.album.image && (
          <Image
            src={track.album.image}
            alt={track.album.name}
            width={56}
            height={56}
            className={`h-14 w-14 rounded-lg border border-zinc-300 object-cover ${isCurrent ? "border-zinc-900" : ""}`}
          />
        )}
        {isSelected && (
          <CheckmarkBadge
            color="emerald"
            size="md"
            className="absolute -top-1 -right-1"
          />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <h4
            className={`truncate text-sm font-medium transition-colors ${
              isCurrent
                ? "font-semibold text-zinc-900"
                : isSelected
                  ? "text-zinc-900"
                  : "text-zinc-800"
            }`}
          >
            {track.name}
          </h4>
          {track.explicit && (
            <span className="inline-flex items-center rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600">
              E
            </span>
          )}
        </div>
        <p
          className={`truncate text-xs transition-colors ${
            isCurrent
              ? "text-zinc-700"
              : isSelected
                ? "text-zinc-600"
                : "text-zinc-500"
          }`}
        >
          {track.artists.join(", ")} • {track.album.name}
        </p>
        <p
          className={`text-xs font-medium transition-colors ${
            isCurrent
              ? "text-zinc-700"
              : isSelected
                ? "text-zinc-500"
                : "text-zinc-500"
          }`}
        >
          {formatDurationMs(track.duration_ms)}
        </p>
      </div>

      {isCurrent && (
        <div className="absolute top-1/2 right-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-900 bg-zinc-900">
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
