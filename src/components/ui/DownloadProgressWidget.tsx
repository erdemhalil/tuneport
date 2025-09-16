import { useState, useEffect } from "react";
import Image from "next/image";
import { useDownloads } from "~/contexts/DownloadContext";

export function DownloadProgressWidget() {
  const { jobs, removeJob, clearCompleted } = useDownloads();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloadedJobs, setDownloadedJobs] = useState<Set<string>>(new Set());

  // Auto-download completed jobs
  useEffect(() => {
    jobs.forEach((job) => {
      if (
        job.status === "completed" &&
        job.result?.downloadId &&
        !downloadedJobs.has(job.jobId)
      ) {
        console.log(
          `Auto-downloading completed job: ${job.jobId} - ${job.trackName}`,
        );
        // Trigger download
        const downloadUrl = `/api/download/${job.result.downloadId}`;
        console.log(`Download URL: ${downloadUrl}`);

        // Try multiple approaches for browser compatibility
        try {
          // Method 1: Create and click a link with proper filename
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = `${job.artistName} - ${job.trackName}.mp3`; // Suggest filename
          link.style.display = "none";

          // Add to DOM temporarily
          document.body.appendChild(link);

          console.log("Clicking download link...");
          link.click();

          // Remove from DOM
          document.body.removeChild(link);
          console.log("Download link clicked and removed");

          // Mark as downloaded to avoid duplicate downloads
          setDownloadedJobs((prev) => new Set(prev).add(job.jobId));
        } catch (error) {
          console.error("Download failed:", error);
          // Fallback: open in new tab (less ideal but works)
          console.log("Falling back to opening in new tab");
          window.open(downloadUrl, "_blank");
          setDownloadedJobs((prev) => new Set(prev).add(job.jobId));
        }
      }
    });
  }, [jobs, downloadedJobs]);

  const triggerDownload = (
    downloadId: string,
    trackName?: string,
    artistName?: string,
  ) => {
    console.log(`Manual download triggered for: ${downloadId}`);
    const downloadUrl = `/api/download/${downloadId}`;
    console.log(`Manual download URL: ${downloadUrl}`);

    try {
      // Create and click a link with proper filename
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download =
        trackName && artistName ? `${artistName} - ${trackName}.mp3` : ""; // Suggest filename
      link.className = "hidden"; // Use Tailwind hidden class
      document.body.appendChild(link);
      console.log("Clicking manual download link...");
      link.click();
      document.body.removeChild(link);
      console.log("Manual download link clicked and removed");
    } catch (error) {
      console.error("Manual download failed:", error);
      // Fallback: open in new tab
      console.log("Falling back to opening in new tab");
      window.open(downloadUrl, "_blank");
    }
  };

  if (jobs.length === 0) {
    return null;
  }

  const activeJobs = jobs.filter(
    (job) => !["completed", "failed"].includes(job.status),
  );
  const completedJobs = jobs.filter((job) => job.status === "completed");
  const failedJobs = jobs.filter((job) => job.status === "failed");

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

  // Helper function to get progress bar class
  const getProgressClass = (progress: number): string => {
    const clamped = Math.min(100, Math.max(0, progress));
    const rounded = Math.round(clamped / 5) * 5; // Round to nearest 5
    return `w-progress-${rounded}`;
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (isMinimized) {
    return (
      <div className="animate-scale-in fixed right-6 bottom-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="glass group flex items-center justify-between w-80 rounded-2xl border border-white/20 px-6 py-4 shadow-lg transition-all duration-200 hover:shadow-xl hover:border-purple-400/40"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-4 w-4 animate-pulse rounded-full bg-blue-400"></div>
              {activeJobs.length > 0 && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400"></div>
              )}
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-white">
                Downloads
              </div>
              <div className="text-xs text-neutral-300">
                {activeJobs.length > 0
                  ? `${activeJobs.length} active`
                  : `${jobs.length} total`}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
              Expand
            </span>
            <svg
              className="h-5 w-5 text-purple-400 transition-colors group-hover:text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="animate-scale-in fixed right-6 bottom-6 z-50 w-96">
      <div className="glass overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
        {/* Premium Header */}
        <div className="flex items-center justify-between border-b border-white/20 bg-white/10 px-6 py-5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              {activeJobs.length > 0 && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white/20"></div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Downloads</h3>
              <div className="text-sm text-neutral-300">
                {activeJobs.length > 0 && (
                  <span className="text-blue-400 font-medium">{activeJobs.length} active</span>
                )}
                {activeJobs.length > 0 && completedJobs.length > 0 && <span> • </span>}
                {completedJobs.length > 0 && (
                  <span className="text-emerald-400 font-medium">{completedJobs.length} completed</span>
                )}
                {(activeJobs.length > 0 || completedJobs.length > 0) && failedJobs.length > 0 && <span> • </span>}
                {failedJobs.length > 0 && (
                  <span className="text-red-400 font-medium">{failedJobs.length} failed</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {completedJobs.length > 0 && (
              <button
                onClick={clearCompleted}
                className="inline-flex items-center justify-center rounded-xl bg-white/10 p-2.5 text-neutral-300 transition-all duration-200 hover:bg-white/20 hover:text-white"
                title="Clear completed downloads"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setIsMinimized(true)}
              className="inline-flex items-center justify-center rounded-xl bg-white/10 p-2.5 text-neutral-300 transition-all duration-200 hover:bg-white/20 hover:text-white"
              title="Minimize downloads"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Premium Jobs List */}
        <div className={`max-h-[500px] overflow-y-auto ${isExpanded ? "max-h-none" : ""}`}>
          {jobs.map((job) => (
            <div key={job.jobId} className="border-b border-white/10 last:border-b-0">
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
                        {job.artistName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {job.status === "completed" && job.result?.downloadId && (
                      <button
                        onClick={() =>
                          triggerDownload(
                            job.result!.downloadId,
                            job.trackName,
                            job.artistName,
                          )
                        }
                        className="inline-flex items-center justify-center rounded-xl bg-purple-500 p-2.5 text-white shadow-sm transition-all duration-200 hover:bg-purple-400 hover:shadow-md"
                        title="Download file"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => removeJob(job.jobId)}
                      className="inline-flex items-center justify-center rounded-xl bg-white/10 p-2.5 text-neutral-300 transition-all duration-200 hover:bg-red-500/20 hover:text-red-400"
                      title="Remove download"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Premium Progress Bar */}
                {job.status === "active" && (
                    <div className="space-y-3">
                      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`progress-bar absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ${getProgressClass(job.progress)}`}
                        />
                      </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-purple-400">
                        {Math.round(job.progress)}%
                      </span>
                      <span className="text-sm text-neutral-300 capitalize bg-white/10 px-2 py-1 rounded-md">
                        {job.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status and File Size */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                    {job.status === "completed" && job.result
                      ? formatFileSize(job.result.fileSize)
                      : job.status === "failed"
                      ? "Failed"
                      : "Queued"}
                  </span>
                  {job.status === "failed" && (
                    <span
                      className="max-w-32 truncate text-sm text-red-400 bg-red-500/20 px-2 py-1 rounded-md"
                      title={job.failedReason ?? job.error ?? "Failed"}
                    >
                      {job.failedReason ?? job.error ?? "Error occurred"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Footer */}
        {jobs.length > 3 && (
          <div className="border-t border-white/20 bg-white/5 px-6 py-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-center text-xs font-medium text-neutral-300 transition-colors hover:text-white"
            >
              {isExpanded ? "Show less" : `Show all ${jobs.length} downloads`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
