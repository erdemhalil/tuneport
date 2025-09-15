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

export function PlaylistList({ playlists, onPlaylistClick, isLoading }: PlaylistListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Your Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-4 animate-pulse">
              <div className="w-full aspect-square bg-slate-200 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!playlists.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Playlists</h2>
        <p className="text-slate-500">No playlists found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Your Playlists</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onPlaylistClick?.(playlist.id)}
          >
            {/* Playlist Cover */}
            <div className="aspect-square mb-3 relative overflow-hidden rounded">
              {playlist.image ? (
                <Image
                  src={playlist.image}
                  alt={playlist.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Playlist Info */}
            <div className="space-y-1">
              <h3 className="font-medium text-slate-900 truncate group-hover:text-slate-700">
                {playlist.name}
              </h3>
              {playlist.description && (
                <p className="text-sm text-slate-600 line-clamp-2">
                  {playlist.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{playlist.track_count} songs</span>
                <span>by {playlist.owner}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}