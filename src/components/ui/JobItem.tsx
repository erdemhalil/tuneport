import Image from "next/image";
import type { DownloadJob } from "~/utils/types";
import { formatFileSize } from "./utils";

interface JobItemProps {
  job: DownloadJob;
  onRemove: () => void;
  onDownload?: () => void;
}

export function JobItem({ job, onRemove, onDownload }: JobItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-400";
      case "failed":
        return "text-red-400";
      case "active":
      case "waiting":
        return "text-blue-400";
      default:
        return "text-neutral-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
            <svg
              className="h-3 w-3 text-emerald-400"
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
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20">
            <svg
              className="h-3 w-3 text-red-400"
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
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20">
            <svg
              className="h-3 w-3 animate-spin text-blue-400"
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
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-500/20">
            <svg
              className="h-3 w-3 text-neutral-400"
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

  const progressWidth = `${Math.min(100, Math.max(0, job.progress))}%`;

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {getStatusIcon(job.status)}
            </div>
            {/* Spotify Artwork */}
            <div className="flex-shrink-0">
              {job.artwork ? (
                <Image
                  src={job.artwork}
                  alt={`${job.trackName} album art`}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg object-cover shadow-sm border border-white/20"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center">
                  <svg className="h-6 w-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-base font-medium text-white">
                {job.trackName}
              </h4>
              <p className="truncate text-sm text-neutral-300 mt-1">
                {job.allArtists && job.allArtists.length > 0 
                  ? job.allArtists.join(', ') 
                  : job.artistName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {job.status === "completed" && job.result?.downloadId && onDownload && (
              <button
                onClick={onDownload}
                className="inline-flex items-center justify-center rounded-xl bg-purple-500 p-2.5 text-white shadow-sm transition-all duration-200 hover:bg-purple-400 hover:shadow-md"
                title="Download file"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
            <button
              onClick={onRemove}
              className="inline-flex items-center justify-center rounded-xl bg-white/10 p-2.5 text-neutral-300 transition-all duration-200 hover:bg-red-500/20 hover:text-red-400"
              title="Remove download"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {job.status === "active" && (
          <div className="space-y-3">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                style={{ width: progressWidth }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-purple-400">
                {Math.round(job.progress)}%
              </span>
            </div>
          </div>
        )}

        {/* Status and File Size */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
            {job.status === "completed" && job.result?.fileSize !== undefined
              ? formatFileSize(job.result.fileSize)
              : job.status === "failed"
              ? (job.failedReason ?? job.error ?? "Error occurred")
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
