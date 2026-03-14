import { api } from "~/utils/api";
import { MatchItem } from "./MatchItem";
import type { Track } from "~/utils/types";

interface YouTubeSearchProps {
  track: Pick<Track, "id" | "name" | "artists" | "album" | "duration_ms">;
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

  const matches = searchResults?.matches ?? [];

  const handlePreview = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  return (
    <div className="glass rounded-2xl border border-white/20 p-6 backdrop-blur-xl">
      {matches.length > 0 ? (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchItem
              key={match.videoId}
              match={match}
              isSelected={selectedVideoId === match.videoId}
              onSelect={() => onSelect(match.videoId)}
              onPreview={() => handlePreview(match.videoId)}
            />
          ))}
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
