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
    <div className="border-edge bg-surface h-full min-h-0 rounded-xl border p-4">
      {matches.length > 0 ? (
        <div className="max-h-full space-y-2 overflow-y-auto pr-1">
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
        <div className="text-muted py-8 text-center">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--spinner-track)] border-t-[var(--spinner-head)]"></div>
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
