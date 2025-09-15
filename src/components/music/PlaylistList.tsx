import Image from "next/image";

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  track_count: number;
  owner: string;
}

interface PlaylistListProps {
  playlists: Playlist[];
  onPlaylistClick?: (playlistId: string) => void;
  isLoading?: boolean;
}

export function PlaylistList({
  playlists,
  onPlaylistClick,
  isLoading,
}: PlaylistListProps) {
  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-light tracking-tight text-neutral-900">
            Your Playlists
          </h2>
          <p className="text-neutral-600">
            Organizing your musical collections
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass animate-pulse rounded-2xl p-6">
              <div className="mb-4 aspect-square w-full rounded-xl bg-neutral-200"></div>
              <div className="space-y-3">
                <div className="h-5 w-3/4 rounded bg-neutral-200"></div>
                <div className="h-4 w-1/2 rounded bg-neutral-200"></div>
                <div className="h-3 w-2/3 rounded bg-neutral-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!playlists.length) {
    return (
      <div className="animate-fade-in py-20 text-center">
        <div className="space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <svg
              className="h-8 w-8 text-neutral-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-light tracking-tight text-neutral-900">
              Your Playlists
            </h2>
            <p className="mx-auto max-w-md text-neutral-500">
              No playlists found in your Spotify library. Create some playlists
              in Spotify to see them here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="space-y-3">
        <h2 className="text-3xl font-light tracking-tight text-neutral-900">
          Your Playlists
        </h2>
        <p className="text-neutral-600">
          {playlists.length} playlist{playlists.length === 1 ? "" : "s"} •
          Curated by you
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className={`group glass animate-fade-in cursor-pointer rounded-2xl border border-neutral-200/50 p-6 transition-all duration-300 hover:border-neutral-300/50 hover:shadow-lg`}
            onClick={() => onPlaylistClick?.(playlist.id)}
          >
            {/* Playlist Cover */}
            <div className="relative mb-6 aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200">
              {playlist.image ? (
                <Image
                  src={playlist.image}
                  alt={playlist.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                  <svg
                    className="h-12 w-12 text-neutral-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/10">
                <div className="flex h-12 w-12 scale-0 transform items-center justify-center rounded-full bg-white/0 transition-all duration-300 group-hover:scale-100 group-hover:bg-white/90">
                  <svg
                    className="h-6 w-6 text-neutral-900"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Playlist Info */}
            <div className="space-y-3">
              <div>
                <h3 className="truncate text-lg font-medium text-neutral-900 transition-colors duration-200 group-hover:text-blue-600">
                  {playlist.name}
                </h3>
                {playlist.description && (
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-600">
                    {playlist.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-500">
                  {playlist.track_count} song
                  {playlist.track_count === 1 ? "" : "s"}
                </span>
                <span className="text-xs text-neutral-400">
                  by {playlist.owner}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
