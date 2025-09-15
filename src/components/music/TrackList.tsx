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
        {title && <h2 className="text-xl font-semibold text-slate-900">{title}</h2>}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tracks.length) {
    return (
      <div className="text-center py-12">
        {title && <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>}
        <p className="text-slate-500">No tracks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold text-slate-900">{title}</h2>}
      <div className="space-y-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
            onClick={() => window.open(track.spotify_url, "_blank")}
          >
            {/* Album Art */}
            <div className="relative w-12 h-12 flex-shrink-0">
              {track.album.image ? (
                <Image
                  src={track.album.image}
                  alt={track.album.name}
                  width={48}
                  height={48}
                  className="rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-slate-900 truncate group-hover:text-slate-700">
                  {track.name}
                </h3>
                {track.explicit && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    E
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 truncate">
                {track.artists.join(", ")} • {track.album.name}
              </p>
              {track.added_at && (
                <p className="text-xs text-slate-500">
                  Added {formatDate(track.added_at)}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="text-sm text-slate-500 font-mono">
              {formatDuration(track.duration_ms)}
            </div>

            {/* Play Button */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}