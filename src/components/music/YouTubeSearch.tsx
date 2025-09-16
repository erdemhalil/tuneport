import Image from "next/image";

import { api } from "~/utils/api";

interface YouTubeSearchProps {
  track: {
    id: string;
    name: string;
    artists: string[];
    album: {
      name: string;
      image?: string;
    };
    duration_ms: number;
  };
  selectedVideoId?: string;
  onSelect: (videoId: string) => void;
}

export function YouTubeSearch({
  track,
  selectedVideoId,
  onSelect,
}: YouTubeSearchProps) {
  const { data: searchResults, isLoading } = api.youtube.searchYouTube.useQuery(
    {
      trackName: track.name,
      artistName: track.artists[0] ?? "",
      albumName: track.album.name,
      durationMs: track.duration_ms,
    },
    {
      enabled: true, // Always search when component mounts with a track
    },
  );

  const formatDuration = (duration: string) => {
    // Parse YouTube duration format (PT4M13S) to readable format
    const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(duration);
    if (!match) return "0:00";

    const hours = parseInt(match[1] ?? "0");
    const minutes = parseInt(match[2] ?? "0");
    const seconds = parseInt(match[3] ?? "0");

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-emerald-400 bg-emerald-500/20";
    if (confidence >= 60) return "text-yellow-400 bg-yellow-500/20";
    return "text-red-400 bg-red-500/20";
  };

  // Ensure matches is a safe, typed array before accessing members
  type Match = {
    videoId: string;
    title: string;
    channel: string;
    duration: string;
    thumbnail: string;
    confidence: number;
    explicit: boolean;
  };

  const _raw = (searchResults as unknown) as { matches?: unknown };
  const matches: Match[] = Array.isArray(_raw.matches) ? (_raw.matches as Match[]) : [];

  return (
    <div className="glass rounded-2xl border border-white/20 p-6 backdrop-blur-xl">
      {/* Removed small header to keep focus on matches */}

      {matches.length > 0 ? (
        <div className="space-y-3">
          {matches.map(
            (match: {
              videoId: string;
              title: string;
              channel: string;
              duration: string;
              thumbnail: string;
              confidence: number;
              explicit: boolean;
            }) => (
              <div
                key={match.videoId}
                className={`flex cursor-pointer items-center space-x-3 rounded-xl border p-3 transition-all duration-200 ${
                  selectedVideoId === match.videoId
                    ? "border-purple-400 bg-gradient-to-r from-purple-500/40 to-blue-500/30 ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900 shadow-xl scale-[1.02]"
                    : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
                onClick={() => onSelect(match.videoId)}
              >
                <div className={`${selectedVideoId === match.videoId ? 'relative flex-shrink-0 h-20 w-20' : 'relative flex-shrink-0 h-16 w-16'}`}>
                  <Image
                    src={match.thumbnail}
                    alt={match.title}
                    fill
                    className={`rounded-lg object-cover transition-all duration-200 ${selectedVideoId === match.videoId ? 'ring-2 ring-purple-300 shadow-lg' : ''}`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className={`truncate text-sm font-medium transition-colors ${selectedVideoId === match.videoId ? 'text-white font-semibold' : 'text-white'}`}>
                      {match.title}
                    </h4>
                    {match.explicit && (
                      <span className="inline-flex items-center rounded bg-red-500/20 px-1.5 py-0.5 text-xs font-medium text-red-400">
                        E
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-gray-400">
                    {match.channel}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`text-xs ${selectedVideoId === match.videoId ? 'text-purple-200' : 'text-gray-500'}`}>
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
                      window.open(
                        `https://www.youtube.com/watch?v=${match.videoId}`,
                        "_blank",
                      );
                    }}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Preview on YouTube"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>

                  {selectedVideoId === match.videoId && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-500">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-400">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-purple-500"></div>
              <span>Searching YouTube...</span>
            </div>
          ) : (
            <p>No YouTube matches found for this track</p>
          )}
        </div>
      )}
    </div>
  );
}
