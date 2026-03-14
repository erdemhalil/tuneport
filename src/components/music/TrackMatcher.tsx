import { useState } from "react";

import { YouTubeSearch } from "./YouTubeSearch";
import { TrackItem } from "./TrackItem";
import { useDownloadMutation } from "~/hooks/useDownloadMutation";
import type { Collection, Track } from "~/utils/types";
import { validateDownloadSelectionCount } from "~/utils/downloadSelection";
import { Pagination } from "~/components/ui/Pagination";
import { DownloadActionBar } from "~/components/ui/DownloadActionBar";
import { SkeletonRepeater } from "~/components/ui/SkeletonRepeater";

interface TrackMatcherProps {
  collection: Collection;
  tracks: Track[];
  isLoading?: boolean;
  isPaginating?: boolean;
  showHeader?: boolean;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export function TrackMatcher({
  collection,
  tracks,
  isLoading,
  isPaginating,
  showHeader = true,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 50,
  onPageChange,
}: TrackMatcherProps) {
  const [selectedTracks, setSelectedTracks] = useState<Record<string, string>>(
    {},
  );
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  const downloadMutation = useDownloadMutation((job) => {
    const track = tracks.find(
      (t) => t.name === job.trackName && t.artists.includes(job.artistName),
    );
    return {
      allArtists: track?.artists ?? [job.artistName],
      artwork: track?.album.image ?? undefined,
    };
  });

  const handleTrackSelect = (trackId: string) => {
    setCurrentTrackId(trackId);
  };

  const handleYouTubeSelect = (trackId: string, videoId: string) => {
    setSelectedTracks((prev) => {
      const currentSelection = prev[trackId];
      if (currentSelection === videoId) {
        // If clicking the same video, deselect it
        const newSelection = { ...prev };
        delete newSelection[trackId];
        return newSelection;
      } else {
        // Select the new video
        return {
          ...prev,
          [trackId]: videoId,
        };
      }
    });
  };

  const handleDownload = () => {
    const tracksToDownload = Object.entries(selectedTracks)
      .map(([trackId, videoId]) => {
        const track = tracks.find((t) => t.id === trackId);
        if (!track) return null;

        return {
          videoId,
          trackName: track.name,
          artistName: track.artists[0] ?? "Unknown Artist",
          allArtists: track.artists,
          artwork: track.album.image ?? undefined,
        };
      })
      .filter((track): track is NonNullable<typeof track> => track !== null);

    const validationError = validateDownloadSelectionCount(
      tracksToDownload.length,
      "tracks",
    );
    if (validationError) {
      alert(validationError);
      return;
    }

    downloadMutation.mutate({ tracks: tracksToDownload });
  };

  const currentTrack = tracks.find((track) => track.id === currentTrackId);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-8">
        {showHeader && (
          <div className="space-y-3">
            <h2 className="text-3xl font-light tracking-tight text-white">
              {collection.name}
            </h2>
            <p className="text-gray-400">Loading your music collection</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-white">Spotify Library</h3>
            <div className="space-y-3">
              <SkeletonRepeater count={6}>
                {(i) => (
                  <div
                    key={i}
                    className="glass flex animate-pulse items-center space-x-4 rounded-2xl p-4"
                  >
                    <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-white/10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-white/10"></div>
                      <div className="h-3 w-1/2 rounded bg-white/10"></div>
                    </div>
                  </div>
                )}
              </SkeletonRepeater>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="mb-6 h-6 w-1/3 rounded bg-white/10"></div>
            <div className="space-y-4">
              <SkeletonRepeater count={3}>
                {(i) => (
                  <div
                    key={i}
                    className="flex animate-pulse items-center space-x-4 rounded-xl border border-white/20 p-4"
                  >
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-white/10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-white/10"></div>
                      <div className="h-3 w-1/2 rounded bg-white/10"></div>
                    </div>
                  </div>
                )}
              </SkeletonRepeater>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-light tracking-tight text-white">
              {collection.name}
            </h2>
            <p className="text-gray-400">
              {Object.keys(selectedTracks).length > 0
                ? `${Object.keys(selectedTracks).length} of ${tracks.length} selected`
                : `${tracks.length} ${tracks.length === 1 ? "song" : "songs"}`}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Spotify Tracks List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-white">
              Your Spotify Library
            </h3>
            <div>
              {Object.keys(selectedTracks).length > 0 && (
                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-200">
                  {Object.keys(selectedTracks).length} selected
                </span>
              )}
            </div>
          </div>

          <div className="max-h-[600px] space-y-4 overflow-y-auto py-2 pr-3 pl-2">
            {tracks.map((track) => (
              <TrackItem
                key={track.id}
                track={track}
                isSelected={!!selectedTracks[track.id]}
                isCurrent={currentTrackId === track.id}
                onClick={() => handleTrackSelect(track.id)}
              />
            ))}
            {isPaginating && (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <p className="mb-3 text-sm text-gray-400">
                  Loading next page...
                </p>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="glass animate-breathe flex animate-pulse items-center space-x-4 rounded-2xl p-4 opacity-70"
                  >
                    <div className="animate-breathe h-14 w-14 flex-shrink-0 rounded-xl bg-white/10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="animate-breathe h-4 w-3/4 rounded bg-white/10"></div>
                      <div className="animate-breathe h-3 w-1/2 rounded bg-white/10"></div>
                      <div className="animate-breathe h-3 w-1/4 rounded bg-white/10"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination within Spotify Library section */}
          {onPageChange && totalItems > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              className="mt-6"
            />
          )}
        </div>

        {/* YouTube Search Panel */}
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-white">YouTube Matches</h3>
          {currentTrack ? (
            <YouTubeSearch
              track={currentTrack}
              selectedVideoId={selectedTracks[currentTrack.id]}
              onSelect={(videoId) =>
                handleYouTubeSelect(currentTrack.id, videoId)
              }
            />
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h4 className="mb-2 text-lg font-medium text-white">
                Ready to Match
              </h4>
              <p className="mx-auto max-w-sm leading-relaxed text-gray-400">
                Select a track from your Spotify library to find YouTube matches
                and start building your collection
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <DownloadActionBar
        selectedCount={Object.keys(selectedTracks).length}
        isPending={downloadMutation.isPending}
        onClear={() => setSelectedTracks({})}
        onDownload={handleDownload}
      />
    </div>
  );
}
