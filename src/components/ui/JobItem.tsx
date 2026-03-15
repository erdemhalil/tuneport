import Image from "next/image";
import type { DownloadJobStatus } from "~/utils/types";
import type { DownloadJob } from "~/utils/types";

interface JobItemProps {
  job: DownloadJob;
  onRemove: () => void;
  onDownload?: () => void;
}

export function JobItem({ job, onRemove, onDownload }: JobItemProps) {
  const getStatusColor = (status: DownloadJobStatus) => {
    switch (status) {
      case "completed":
        return "text-emerald-500";
      case "failed":
        return "text-rose-500";
      case "active":
        return "text-sky-500";
      case "waiting":
        return "text-amber-500";
      default:
        return "text-muted";
    }
  };

  const getStatusIcon = (status: DownloadJobStatus) => {
    switch (status) {
      case "completed":
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/15">
            <svg
              className="h-3 w-3 text-emerald-500"
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
        );
      case "failed":
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/15">
            <svg
              className="h-3 w-3 text-rose-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "active":
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-sky-500/20 bg-sky-500/15">
            <svg
              className="h-3 w-3 animate-spin text-sky-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/15">
            <svg
              className="h-3 w-3 text-amber-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  const progressStep =
    Math.round(Math.min(100, Math.max(0, job.progress)) / 5) * 5;
  const progressClass = `w-progress-${progressStep}`;

  return (
    <div className="border-edge bg-surface/70 border-b last:border-b-0">
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center space-x-3">
            <div className="shrink-0">{getStatusIcon(job.status)}</div>
            {/* Spotify Artwork */}
            <div className="shrink-0">
              {job.artwork ? (
                <Image
                  src={job.artwork}
                  alt={`${job.trackName} album art`}
                  width={48}
                  height={48}
                  className="border-edge h-12 w-12 rounded-lg border object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="border-edge bg-inset flex h-12 w-12 items-center justify-center rounded-lg border">
                  <svg
                    className="text-muted h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-primary truncate text-sm font-semibold">
                {job.trackName}
              </h4>
              <p className="text-secondary mt-0.5 truncate text-xs">
                {job.allArtists && job.allArtists.length > 0
                  ? job.allArtists.join(", ")
                  : job.artistName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start">
            {job.status === "completed" &&
              job.result?.downloadId &&
              onDownload && (
                <button
                  onClick={onDownload}
                  className="border-accent bg-accent hover:bg-accent-hover inline-flex h-8 w-8 items-center justify-center rounded-md border text-white transition-colors"
                  title="Download file"
                >
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
                </button>
              )}
            <button
              onClick={onRemove}
              className="border-edge bg-inset text-secondary hover:bg-surface-hover hover:text-primary inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
              title="Remove download"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {job.status === "active" && (
          <div className="space-y-2">
            <div className="bg-inset relative h-2.5 w-full overflow-hidden rounded-full">
              <div
                className={`absolute top-0 left-0 h-2.5 rounded-full bg-sky-500 transition-all duration-300 ${progressClass}`}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-500">
                {Math.round(progressStep)}%
              </span>
            </div>
          </div>
        )}

        {/* Failure message */}
        {job.status === "failed" && (
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${getStatusColor(job.status)}`}
            >
              {job.failedReason ?? job.error ?? "Error occurred"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
