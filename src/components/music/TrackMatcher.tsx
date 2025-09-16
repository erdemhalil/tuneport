import { useState } from "react";
import Image from "next/image";

import { YouTubeSearch } from "./YouTubeSearch";
import { api } from "~/utils/api";
import { useDownloads } from "~/contexts/DownloadContext";
import type { Collection, Track } from "~/utils/types";
import { Pagination } from "~/components/ui/Pagination";

interface TrackMatcherProps {
  collection: Collection;
  tracks: Track[];
  isLoading?: boolean;
  showHeader?: boolean;
  // Pagination props
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export function TrackMatcher({ 
  collection, 
  tracks, 
  isLoading, 
  showHeader = true,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 50,
  onPageChange
}: TrackMatcherProps) {
  const [selectedTracks, setSelectedTracks] = useState<Record<string, string>>(
    {},
  );
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const { addJobs } = useDownloads();

  // Download mutation
  const downloadMutation = api.youtube.downloadTracks.useMutation({
    onSuccess: (data) => {
      console.log("🎉 Download mutation success:", data);
      // Add jobs to the download context for progress tracking
      const validJobs = data.jobs
        .filter((job) => job.jobId)
        .map((job) => {
          // Find the corresponding track to get artwork
          const track = tracks.find((t) => t.name === job.trackName && t.artists.includes(job.artistName));
          return {
            jobId: job.jobId!,
            videoId: job.videoId,
            trackName: job.trackName,
            artistName: job.artistName,
            artwork: track?.album.image,
          };
        });
      addJobs(validJobs);
    },
    onError: (error) => {
      console.error("❌ Download mutation error:", error);
      alert(`Download failed: ${error.message}`);
    },
  });

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

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
          allArtists: track.artists, // Pass all artists from Spotify
          artwork: track.album.image, // Pass Spotify album artwork
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
            <h3 className="text-xl font-medium text-white">
              Spotify Library
            </h3>
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
                : `${tracks.length} ${tracks.length === 1 ? 'song' : 'songs'}`}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Spotify Tracks List - Premium Design */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-white">Your Spotify Library</h3>
            <div>
              {Object.keys(selectedTracks).length > 0 && (
                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-200">
                  {Object.keys(selectedTracks).length} selected
                </span>
              )}
            </div>
          </div>

          <div className="max-h-[600px] space-y-4 overflow-y-auto pr-3 pl-2 py-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`group glass relative flex cursor-pointer items-center space-x-4 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  currentTrackId === track.id
                    ? "bg-gradient-to-r from-purple-500/50 to-blue-500/50 ring-2 ring-purple-300 ring-offset-2 ring-offset-slate-900 shadow-xl shadow-purple-500/30 scale-[1.02] border border-purple-300/50"
                    : "hover:bg-white/15 hover:ring-1 hover:ring-white/30"
                } ${selectedTracks[track.id] ? "bg-emerald-500/30 ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-emerald-500/20" : ""}`}
                onClick={() => handleTrackSelect(track.id)}
              >
                <div className="relative flex-shrink-0">
                  {track.album.image && (
                    <Image
                      src={track.album.image}
                      alt={track.album.name}
                      width={56}
                      height={56}
                      className={`h-14 w-14 rounded-xl object-cover shadow-sm transition-all duration-200 ${
                        currentTrackId === track.id 
                          ? "ring-2 ring-purple-300 shadow-lg shadow-purple-500/30" 
                          : ""
                      }`}
                    />
                  )}
                  {selectedTracks[track.id] && (
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
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
                  {/* left indicator removed - replaced by right-side indicator below */}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className={`truncate text-sm font-medium transition-colors ${
                      currentTrackId === track.id 
                        ? "text-white font-semibold" 
                        : selectedTracks[track.id]
                        ? "text-emerald-200"
                        : "text-white group-hover:text-purple-300"
                    }`}>
                      {track.name}
                    </h4>
                    {track.explicit && (
                      <span className="inline-flex items-center rounded-md bg-white/20 px-1.5 py-0.5 text-xs font-medium text-gray-300">
                        E
                      </span>
                    )}
                  </div>
                  <p className={`truncate text-xs transition-colors ${
                    currentTrackId === track.id
                      ? "text-purple-100"
                      : selectedTracks[track.id]
                      ? "text-gray-300"
                      : "text-gray-400 group-hover:text-gray-300"
                  }`}>
                    {track.artists.join(", ")} • {track.album.name}
                  </p>
                  <p className={`text-xs font-medium transition-colors ${
                    currentTrackId === track.id
                      ? "text-purple-200"
                      : selectedTracks[track.id]
                      ? "text-gray-400"
                      : "text-gray-500 group-hover:text-gray-400"
                  }`}>
                    {formatDuration(track.duration_ms)}
                  </p>
                </div>
                {/* Right-side selection indicator for current track */}
                {currentTrackId === track.id && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 shadow-lg animate-pulse">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
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

        {/* YouTube Search Panel - Premium Design */}
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-white">
            YouTube Matches
          </h3>
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

      {/* Premium Action Bar */}
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
                className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-6 py-3 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
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
