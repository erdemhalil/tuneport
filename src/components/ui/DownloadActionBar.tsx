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
    <div className="glass animate-slide-in rounded-2xl border border-white/20 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-lg font-medium text-white">
            {selectedCount} {selectedCount === 1 ? "track" : "tracks"} ready
          </div>
          <div className="text-sm text-gray-400">
            Selected and ready for download
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onClear}
            className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
          >
            Clear All
          </button>
          <button
            onClick={onDownload}
            disabled={isPending}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-blue-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
