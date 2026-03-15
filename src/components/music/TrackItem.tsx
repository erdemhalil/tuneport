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
    "group relative flex cursor-pointer items-center space-x-4 rounded-xl border p-4 transition-colors";
  const stateClasses = isCurrent
    ? "border-edge-strong bg-surface-hover"
    : isSelected
      ? "border-edge-strong bg-surface"
      : "border-edge bg-surface hover:bg-surface-hover";

  return (
    <div className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
      <div className="relative shrink-0">
        {track.album.image && (
          <Image
            src={track.album.image}
            alt={track.album.name}
            width={56}
            height={56}
            className={`h-14 w-14 rounded-lg border object-cover ${isCurrent ? "border-edge-strong" : "border-edge"}`}
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
              isCurrent ? "text-accent font-semibold" : "text-primary"
            }`}
          >
            {track.name}
          </h4>
          {track.explicit && (
            <span className="border-edge bg-inset text-secondary inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium">
              E
            </span>
          )}
        </div>
        <p
          className={`truncate text-xs transition-colors ${
            isCurrent
              ? "text-secondary"
              : isSelected
                ? "text-secondary"
                : "text-muted"
          }`}
        >
          {track.artists.join(", ")} • {track.album.name}
        </p>
        <p className="text-muted text-xs font-medium transition-colors">
          {formatDurationMs(track.duration_ms)}
        </p>
      </div>

      {isCurrent && (
        <div className="bg-accent shadow-accent/25 absolute top-1/2 right-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-md">
          <svg
            className="h-4 w-4"
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
