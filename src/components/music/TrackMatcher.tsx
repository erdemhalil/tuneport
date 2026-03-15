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
        const newSelection = { ...prev };
        delete newSelection[trackId];
        return newSelection;
      } else {
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
      <div className="animate-fade-in h-full space-y-8 overflow-y-auto pr-1">
        {showHeader && (
          <div className="space-y-3">
            <h2 className="text-primary text-3xl font-semibold tracking-tight">
              {collection.name}
            </h2>
            <p className="text-secondary">Loading your music collection</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-primary text-xl font-semibold">
              Spotify Library
            </h3>
            <div className="space-y-3">
              <SkeletonRepeater count={6}>
                {(i) => (
                  <div
                    key={i}
                    className="border-edge bg-surface flex animate-pulse items-center space-x-4 rounded-xl border p-4"
                  >
                    <div className="bg-inset h-14 w-14 shrink-0 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-inset h-4 w-3/4 rounded"></div>
                      <div className="bg-inset h-3 w-1/2 rounded"></div>
                    </div>
                  </div>
                )}
              </SkeletonRepeater>
            </div>
          </div>
          <div className="border-edge bg-surface rounded-xl border p-6">
            <div className="bg-inset mb-6 h-6 w-1/3 rounded"></div>
            <div className="space-y-4">
              <SkeletonRepeater count={3}>
                {(i) => (
                  <div
                    key={i}
                    className="border-edge flex animate-pulse items-center space-x-4 rounded-lg border p-4"
                  >
                    <div className="bg-inset h-16 w-16 shrink-0 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-inset h-4 w-3/4 rounded"></div>
                      <div className="bg-inset h-3 w-1/2 rounded"></div>
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
    <div className="animate-fade-in flex h-full min-h-0 flex-col gap-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-primary text-3xl font-semibold tracking-tight">
              {collection.name}
            </h2>
            <p className="text-secondary">
              {Object.keys(selectedTracks).length > 0
                ? `${Object.keys(selectedTracks).length} of ${tracks.length} selected`
                : `${tracks.length} ${tracks.length === 1 ? "song" : "songs"}`}
            </p>
          </div>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Spotify Tracks List */}
        <div className="flex min-h-0 flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-primary text-xl font-semibold">
              Your Spotify Library
            </h3>
            <div>
              {Object.keys(selectedTracks).length > 0 && (
                <span className="border-edge-strong bg-surface text-secondary inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                  {Object.keys(selectedTracks).length} selected
                </span>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-1 pr-2 pl-1">
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
              <div className="border-edge space-y-3 border-t pt-4">
                <p className="text-muted mb-3 text-sm">Loading next page...</p>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="border-edge bg-surface flex animate-pulse items-center space-x-4 rounded-xl border p-4 opacity-80"
                  >
                    <div className="bg-inset h-14 w-14 shrink-0 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-inset h-4 w-3/4 rounded"></div>
                      <div className="bg-inset h-3 w-1/2 rounded"></div>
                      <div className="bg-inset h-3 w-1/4 rounded"></div>
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
        <div className="flex min-h-0 flex-col gap-4">
          <h3 className="text-primary text-xl font-semibold">
            YouTube Matches
          </h3>
          {currentTrack ? (
            <div className="min-h-0 flex-1">
              <YouTubeSearch
                track={currentTrack}
                selectedVideoId={selectedTracks[currentTrack.id]}
                onSelect={(videoId) =>
                  handleYouTubeSelect(currentTrack.id, videoId)
                }
              />
            </div>
          ) : (
            <div className="border-edge bg-surface flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border p-8 text-center">
              <div className="border-edge bg-inset mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border">
                <svg
                  className="text-muted h-8 w-8"
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
              <h4 className="text-primary mb-2 text-lg font-semibold">
                Ready to Match
              </h4>
              <p className="text-secondary mx-auto max-w-sm leading-relaxed">
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
