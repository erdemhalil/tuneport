import { useEffect, useState, type FormEvent } from "react";

import { api } from "~/utils/api";
import { useDownloadMutation } from "~/hooks/useDownloadMutation";
import { MatchItem } from "~/components/music/MatchItem";
import { DownloadActionBar } from "~/components/ui/DownloadActionBar";
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

  const searchResult = api.youtube.searchYouTubeByQuery.useQuery(
    { query: searchQuery, maxResults: displayLimit },
    { enabled: mode === "search" && searchQuery.length > 0 },
  );

  const resolveResult = api.youtube.resolveYouTubeVideo.useQuery(
    { videoId },
    { enabled: mode === "url" && videoId.length > 0 },
  );

  const isLoading =
    (mode === "search" && searchResult.isLoading) ||
    (mode === "url" && resolveResult.isLoading);

  const errorMessage =
    (mode === "search" && searchResult.error?.message) ||
    (mode === "url" && resolveResult.error?.message) ||
    null;

  const matches =
    mode === "search"
      ? (searchResult.data?.matches ?? [])
      : mode === "url"
        ? resolveResult.data?.match
          ? [resolveResult.data.match]
          : []
        : [];

  const resolvedMatch = resolveResult.data?.match;

  useEffect(() => {
    if (mode === "url" && resolvedMatch) {
      setSelectedVideoIds({ [resolvedMatch.videoId]: true });
    }
  }, [mode, resolvedMatch]);

  const downloadMutation = useDownloadMutation((job) => {
    const matchesById = new Map(matches.map((match) => [match.videoId, match]));
    const match = matchesById.get(job.videoId);
    return {
      allArtists: match ? [match.channel] : undefined,
      artwork: match?.thumbnail,
    };
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

    if (extractedVideoId) {
      setMode("url");
      setVideoId(extractedVideoId);
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

      <DownloadActionBar
        selectedCount={Object.keys(selectedVideoIds).length}
        isPending={downloadMutation.isPending}
        onClear={() => setSelectedVideoIds({})}
        onDownload={handleDownload}
      />
    </section>
  );
}
