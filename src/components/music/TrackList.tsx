import Image from "next/image";

interface Track {
  id: string;
  name: string;
  artists: string[];
  album: {
    name: string;
    image?: string;
  };
  duration_ms: number;
  explicit?: boolean;
  added_at?: string;
  spotify_url: string;
}

interface TrackListProps {
  tracks: Track[];
  title?: string;
  isLoading?: boolean;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

export function TrackList({ tracks, title, isLoading }: TrackListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && (
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        )}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center space-x-3 rounded-lg bg-slate-50 p-3"
            >
              <div className="h-12 w-12 rounded bg-slate-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200"></div>
                <div className="h-3 w-1/2 rounded bg-slate-200"></div>
              </div>
              <div className="h-4 w-12 rounded bg-slate-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tracks.length) {
    return (
      <div className="py-12 text-center">
        {title && (
          <h2 className="mb-4 text-xl font-semibold text-slate-900">{title}</h2>
        )}
        <p className="text-slate-500">No tracks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      )}
      <div className="space-y-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="group flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors hover:bg-slate-50"
            onClick={() => window.open(track.spotify_url, "_blank")}
          >
            {/* Album Art */}
            <div className="relative h-12 w-12 flex-shrink-0">
              {track.album.image ? (
                <Image
                  src={track.album.image}
                  alt={track.album.name}
                  width={48}
                  height={48}
                  className="rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-200">
                  <svg
                    className="h-6 w-6 text-slate-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="truncate font-medium text-slate-900 group-hover:text-slate-700">
                  {track.name}
                </h3>
                {track.explicit && (
                  <span className="inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800">
                    E
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-slate-600">
                {track.artists.join(", ")} • {track.album.name}
              </p>
              {track.added_at && (
                <p className="text-xs text-slate-500">
                  Added {formatDate(track.added_at)}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="font-mono text-sm text-slate-500">
              {formatDuration(track.duration_ms)}
            </div>

            {/* Play Button */}
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <svg
                className="h-5 w-5 text-slate-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
