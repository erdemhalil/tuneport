"use client";

import { useEffect, useState, type FormEvent } from "react";

import { api } from "~/utils/api";
import { useDownloads } from "~/contexts/DownloadContext";
import { MatchItem } from "~/components/music/MatchItem";
import { extractYouTubeVideoId, isYouTubeUrl } from "~/utils/youtube";

export function YouTubeMp3() {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [videoId, setVideoId] = useState("");
  const [mode, setMode] = useState<"search" | "url" | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(5);
  const [selectedVideoIds, setSelectedVideoIds] = useState<
    Record<string, boolean>
  >({});
  const [matches, setMatches] = useState<
    Array<{
      videoId: string;
      title: string;
      channel: string;
      duration: string;
      thumbnail: string;
      confidence: number;
      explicit: boolean;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { addJobs } = useDownloads();

  useEffect(() => {
    let isActive = true;

    const runSearch = async () => {
      if (mode === "search" && searchQuery.length > 0) {
        setIsLoading(true);
        setErrorMessage(null);
        try {
          const response = await fetch(
            `/api/youtube/search?q=${encodeURIComponent(searchQuery)}&limit=${displayLimit}`,
          );
          const data = (await response.json()) as { matches?: unknown };
          if (!response.ok) {
            throw new Error(
              (data as { message?: string }).message ??
                "Failed to search YouTube",
            );
          }

          const nextMatches = Array.isArray(data.matches)
            ? (data.matches as typeof matches)
            : [];

          if (isActive) {
            setMatches(nextMatches);
          }
        } catch (error) {
          if (isActive) {
            setMatches([]);
            setErrorMessage(
              error instanceof Error ? error.message : "Failed to search",
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      if (mode === "url" && videoId.length > 0) {
        setIsLoading(true);
        setErrorMessage(null);
        try {
          const response = await fetch(
            `/api/youtube/resolve?videoId=${encodeURIComponent(videoId)}`,
          );
          const data = (await response.json()) as { match?: unknown };
          if (!response.ok) {
            throw new Error(
              (data as { message?: string }).message ??
                "Failed to resolve YouTube video",
            );
          }

          const resolvedMatch = data.match ? [data.match] : [];
          if (isActive) {
            setMatches(resolvedMatch as typeof matches);
          }
        } catch (error) {
          if (isActive) {
            setMatches([]);
            setErrorMessage(
              error instanceof Error ? error.message : "Failed to resolve",
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }
    };

    void runSearch();

    return () => {
      isActive = false;
    };
  }, [mode, searchQuery, videoId, displayLimit]);

  useEffect(() => {
    if (mode === "url" && matches.length === 1) {
      const match = matches[0];
      if (match) {
        setSelectedVideoIds({ [match.videoId]: true });
      }
    }
  }, [mode, matches]);

  const downloadMutation = api.youtube.downloadTracks.useMutation({
    onSuccess: (data) => {
      const matchesById = new Map(
        matches.map((match) => [match.videoId, match]),
      );
      const validJobs = data.jobs
        .filter((job) => job.jobId)
        .map((job) => {
          const match = matchesById.get(job.videoId);
          return {
            jobId: job.jobId,
            videoId: job.videoId,
            trackName: job.trackName,
            artistName: job.artistName,
            allArtists: job.allArtists ?? (match ? [match.channel] : undefined),
            artwork: match?.thumbnail,
          };
        });
      addJobs(validJobs);
    },
    onError: (error) => {
      alert(`Download failed: ${error.message}`);
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setInputError(null);

    const extractedVideoId = extractYouTubeVideoId(trimmed);
    if (isYouTubeUrl(trimmed) && !extractedVideoId) {
      setInputError("Please paste a valid YouTube video URL.");
      return;
    }

    if (extractedVideoId || isYouTubeUrl(trimmed)) {
      setMode("url");
      setVideoId(extractedVideoId ?? "");
      setSearchQuery("");
    } else {
      setMode("search");
      setSearchQuery(trimmed);
      setVideoId("");
    }

    setSelectedVideoIds({});
    setDisplayLimit(5);
  };

  const handleSelect = (id: string) => {
    setSelectedVideoIds((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
        return next;
      }
      return { ...next, [id]: true };
    });
  };

  const handleDownload = () => {
    const selectedMatches = matches.filter(
      (match) => selectedVideoIds[match.videoId],
    );

    if (selectedMatches.length === 0) {
      alert("No videos selected for download");
      return;
    }

    if (selectedMatches.length > 50) {
      alert("Cannot download more than 50 videos at once");
      return;
    }

    downloadMutation.mutate({
      tracks: selectedMatches.map((match) => ({
        videoId: match.videoId,
        trackName: match.title,
        artistName: match.channel,
        allArtists: [match.channel],
        artwork: match.thumbnail,
        useArtistInFilename: false,
      })),
    });
  };

  return (
    <section className="animate-fade-in space-y-8">
      <div className="space-y-3">
        <h2 className="text-3xl font-light tracking-tight text-white">
          YouTube to MP3
        </h2>
        <p className="text-gray-400">
          Search YouTube or paste a video link to download MP3s instantly.
        </p>
      </div>

      <div className="glass rounded-2xl border border-white/20 p-6 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Search YouTube or paste a link"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-blue-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
            >
              Search
            </button>
          </div>

          {inputError && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              {inputError}
            </div>
          )}
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-medium text-white">Results</h3>
        <div className="glass rounded-2xl border border-white/20 p-6 backdrop-blur-xl">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2 py-10 text-gray-400">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-purple-500"></div>
              <span>Searching YouTube...</span>
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match) => (
                <MatchItem
                  key={match.videoId}
                  match={match}
                  isSelected={!!selectedVideoIds[match.videoId]}
                  onSelect={() => handleSelect(match.videoId)}
                  onPreview={() =>
                    window.open(
                      `https://www.youtube.com/watch?v=${match.videoId}`,
                      "_blank",
                    )
                  }
                />
              ))}
              {mode === "search" && matches.length >= displayLimit && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setDisplayLimit((prev) => prev + 5)}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-gray-200 transition-all duration-200 hover:border-white/25 hover:bg-white/10"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400">
              <p>Search for a song or paste a YouTube link to begin.</p>
            </div>
          )}
        </div>
      </div>

      {Object.keys(selectedVideoIds).length > 0 && (
        <div className="glass animate-slide-in rounded-2xl border border-white/20 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-lg font-medium text-white">
                {Object.keys(selectedVideoIds).length} video
                {Object.keys(selectedVideoIds).length === 1 ? "" : "s"} ready
              </div>
              <div className="text-sm text-gray-400">
                Selected and ready for download
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedVideoIds({})}
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
    </section>
  );
}
