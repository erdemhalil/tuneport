import { useEffect, useState, type FormEvent } from "react";

import { api } from "~/utils/api";
import { useDownloadMutation } from "~/hooks/useDownloadMutation";
import { MatchItem } from "~/components/music/MatchItem";
import { DownloadActionBar } from "~/components/ui/DownloadActionBar";
import { extractYouTubeVideoId, isYouTubeUrl } from "~/utils/youtube";
import { validateDownloadSelectionCount } from "~/utils/downloadSelection";

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
    (mode === "search" && searchResult.error?.message) ??
    (mode === "url" && resolveResult.error?.message) ??
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

    const validationError = validateDownloadSelectionCount(
      selectedMatches.length,
      "videos",
    );
    if (validationError) {
      alert(validationError);
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
    <section className="animate-fade-in flex h-full min-h-0 flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-primary text-3xl font-semibold tracking-tight">
          YouTube to MP3
        </h2>
        <p className="text-secondary text-sm">
          Search YouTube or paste a video link to download MP3s instantly.
        </p>
      </div>

      <div className="border-edge bg-surface rounded-xl border p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Search YouTube or paste a link"
                className="border-edge bg-inset text-primary placeholder:text-muted focus:border-edge-strong focus:ring-ring w-full rounded-md border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="border-accent bg-accent hover:bg-accent-hover focus:ring-accent/40 rounded-md border px-6 py-2.5 text-sm font-medium text-white transition-colors focus:ring-2 focus:outline-none"
            >
              Search
            </button>
          </div>

          {inputError && (
            <div className="border-edge bg-inset text-secondary rounded-md border p-3 text-xs">
              {inputError}
            </div>
          )}
        </form>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <h3 className="text-primary text-xl font-semibold">Results</h3>
        <div className="border-edge bg-surface min-h-0 flex-1 overflow-y-auto rounded-xl border p-4">
          {isLoading ? (
            <div className="text-muted flex items-center justify-center space-x-2 py-10">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--spinner-track)] border-t-[var(--spinner-head)]"></div>
              <span>Searching YouTube...</span>
            </div>
          ) : errorMessage ? (
            <div className="border-edge bg-inset text-secondary rounded-md border p-4 text-sm">
              {errorMessage}
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-2">
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
                    className="border-edge bg-surface-hover text-secondary hover:bg-elevated rounded-md border px-4 py-2 text-xs font-medium transition-colors"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="border-edge bg-inset mb-4 flex h-14 w-14 items-center justify-center rounded-full border">
                <svg
                  className="text-muted h-7 w-7"
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
              <h4 className="text-secondary mb-1 text-sm font-medium">
                No results yet
              </h4>
              <p className="text-muted text-xs">
                Search for a song or paste a YouTube link to begin.
              </p>
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
