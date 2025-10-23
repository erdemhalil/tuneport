import { useState } from "react";

import { YouTubeSearch } from "./YouTubeSearch";
import { TrackItem } from "./TrackItem";
import { api } from "~/utils/api";
import { useDownloads } from "~/contexts/DownloadContext";
import type { Collection, Track } from "~/utils/types";
import { Pagination } from "~/components/ui/Pagination";

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
  const { addJobs } = useDownloads();

  const downloadMutation = api.youtube.downloadTracks.useMutation({
    onSuccess: (data) => {
      console.log("🎉 Download mutation success:", data);

      const validJobs = data.jobs
        .filter((job) => job.jobId)
        .map((job) => {
          const track = tracks.find(
            (t) =>
              t.name === job.trackName && t.artists.includes(job.artistName),
          );
          return {
            jobId: job.jobId,
            videoId: job.videoId,
            trackName: job.trackName,
            artistName: job.artistName,
            allArtists: job.allArtists ?? track?.artists ?? [job.artistName],
            artwork: track?.album.image ?? undefined,
          };
        });
      console.log(
        "Valid jobs with allArtists:",
        validJobs.map((j) => ({
          trackName: j.trackName,
          allArtists: j.allArtists,
        })),
      );
      addJobs(validJobs);
    },
    onError: (error) => {
      console.error("❌ Download mutation error:", error);
      alert(`Download failed: ${error.message}`);
    },
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
    console.log("🎵 handleDownload called");
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

    console.log("📋 Tracks to download:", tracksToDownload);

    if (tracksToDownload.length === 0) {
      alert("No tracks selected for download");
      return;
    }

    if (tracksToDownload.length > 50) {
      alert("Cannot download more than 50 tracks at once");
      return;
    }

    console.log("🚀 Calling download mutation...");
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
              {Array.from({ length: 6 }).map((_, i) => (
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
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="mb-6 h-6 w-1/3 rounded bg-white/10"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
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
              ))}
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
      {Object.keys(selectedTracks).length > 0 && (
        <div className="glass animate-slide-in rounded-2xl border border-white/20 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-lg font-medium text-white">
                {Object.keys(selectedTracks).length} track
                {Object.keys(selectedTracks).length === 1 ? "" : "s"} ready
              </div>
              <div className="text-sm text-gray-400">
                Matched and ready for download
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedTracks({})}
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
              >
                Clear All
              </button>
              <button
                onClick={handleDownload}
                disabled={downloadMutation.isPending}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-blue-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloadMutation.isPending ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Starting Download...</span>
                  </>
                ) : (
                  <>
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span>Download Selected</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
