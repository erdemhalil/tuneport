import { useState } from "react";
import Image from "next/image";

import { YouTubeSearch } from "./YouTubeSearch";
import { api } from "~/utils/api";
import { useDownloads } from "~/contexts/DownloadContext";

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
  spotify_url?: string;
}

interface TrackMatcherProps {
  tracks: Track[];
  title?: string;
  isLoading?: boolean;
}

export function TrackMatcher({ tracks, title, isLoading }: TrackMatcherProps) {
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
        .map((job) => ({
          jobId: job.jobId!,
          videoId: job.videoId,
          trackName: job.trackName,
          artistName: job.artistName,
        }));
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
        <div className="space-y-3">
          <h2 className="text-3xl font-light tracking-tight text-neutral-900">
            {title ?? "Tracks"}
          </h2>
          <p className="text-neutral-600">Loading your music collection</p>
        </div>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-neutral-900">
              Spotify Library
            </h3>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="glass flex animate-pulse items-center space-x-4 rounded-2xl p-4"
                >
                  <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-neutral-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-neutral-200"></div>
                    <div className="h-3 w-1/2 rounded bg-neutral-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="mb-6 h-6 w-1/3 rounded bg-neutral-200"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center space-x-4 rounded-xl border border-neutral-200 p-4"
                >
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-neutral-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-neutral-200"></div>
                    <div className="h-3 w-1/2 rounded bg-neutral-200"></div>
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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-light tracking-tight text-neutral-900">
            {title ?? "Tracks"}
          </h2>
          <p className="text-neutral-600">
            {Object.keys(selectedTracks).length} of {tracks.length} tracks
            matched
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Spotify Tracks List - Premium Design */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-neutral-900">
              Your Spotify Library
            </h3>
            <div className="text-sm text-neutral-500">
              {tracks.length} tracks
            </div>
          </div>

          <div className="max-h-[600px] space-y-4 overflow-y-auto pr-3 pl-2 py-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`group glass flex cursor-pointer items-center space-x-4 rounded-2xl p-4 transition-all duration-200 hover:shadow-md ${
                  currentTrackId === track.id
                    ? "bg-blue-50/50 ring-2 ring-blue-200 ring-offset-2"
                    : "hover:bg-neutral-50/50"
                } ${selectedTracks[track.id] ? "bg-emerald-50/30 ring-2 ring-emerald-200 ring-offset-2" : ""}`}
                onClick={() => handleTrackSelect(track.id)}
              >
                <div className="relative flex-shrink-0">
                  {track.album.image && (
                    <Image
                      src={track.album.image}
                      alt={track.album.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-xl object-cover shadow-sm"
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
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="truncate text-sm font-medium text-neutral-900 transition-colors group-hover:text-blue-600">
                      {track.name}
                    </h4>
                    {track.explicit && (
                      <span className="inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600">
                        E
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-neutral-600">
                    {track.artists.join(", ")} • {track.album.name}
                  </p>
                  <p className="text-xs font-medium text-neutral-500">
                    {formatDuration(track.duration_ms)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* YouTube Search Panel - Premium Design */}
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-neutral-900">
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <svg
                  className="h-8 w-8 text-neutral-400"
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
              <h4 className="mb-2 text-lg font-medium text-neutral-900">
                Ready to Match
              </h4>
              <p className="mx-auto max-w-sm leading-relaxed text-neutral-500">
                Select a track from your Spotify library to find YouTube matches
                and start building your collection
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Premium Action Bar */}
      {Object.keys(selectedTracks).length > 0 && (
        <div className="glass animate-slide-in rounded-2xl border border-neutral-200/50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-lg font-medium text-neutral-900">
                {Object.keys(selectedTracks).length} track
                {Object.keys(selectedTracks).length === 1 ? "" : "s"} ready
              </div>
              <div className="text-sm text-neutral-600">
                Matched and ready for download
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedTracks({})}
                className="rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-600 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none"
              >
                Clear All
              </button>
              <button
                onClick={handleDownload}
                disabled={downloadMutation.isPending}
                className="flex items-center space-x-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
