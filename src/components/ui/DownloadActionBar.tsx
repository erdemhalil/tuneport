interface DownloadActionBarProps {
  selectedCount: number;
  isPending: boolean;
  onClear: () => void;
  onDownload: () => void;
}

export function DownloadActionBar({
  selectedCount,
  isPending,
  onClear,
  onDownload,
}: DownloadActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="animate-slide-in border-edge bg-elevated sticky bottom-0 z-20 rounded-xl border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-primary text-sm font-semibold">
            {selectedCount} {selectedCount === 1 ? "track" : "tracks"} ready
          </div>
          <div className="text-secondary text-xs">
            Selected and ready for download
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClear}
            className="border-edge bg-surface text-secondary hover:bg-surface-hover focus:ring-ring rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus:ring-2 focus:outline-none"
          >
            Clear All
          </button>
          <button
            onClick={onDownload}
            disabled={isPending}
            className="border-accent bg-accent hover:bg-accent-hover focus:ring-accent/40 flex items-center space-x-2 rounded-md border px-3 py-1.5 text-sm font-medium text-white transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
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
  );
}
