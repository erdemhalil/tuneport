import { useState, useEffect } from "react";
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
        return "text-emerald-600";
      case "failed":
        return "text-red-500";
      case "active":
      case "waiting":
        return "text-blue-500";
      default:
        return "text-neutral-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-3 w-3 text-emerald-600"
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
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-3 w-3 text-red-500"
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
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-3 w-3 animate-spin text-blue-500"
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
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100">
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
          className="glass group flex items-center space-x-3 rounded-2xl border border-neutral-200/50 px-6 py-4 shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-neutral-900">
              Downloads
            </div>
            <div className="text-xs text-neutral-500">
              {activeJobs.length > 0
                ? `${activeJobs.length} active`
                : `${jobs.length} total`}
            </div>
          </div>
          <svg
            className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-neutral-600"
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
        </button>
      </div>
    );
  }

  return (
    <div className="animate-scale-in fixed right-6 bottom-6 z-50 max-w-sm">
      <div className="glass overflow-hidden rounded-3xl border border-neutral-200/50 shadow-xl">
        {/* Premium Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/50 bg-white/50 px-6 py-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-neutral-900">Downloads</h3>
            <div className="text-xs text-neutral-500">
              {activeJobs.length > 0 && `${activeJobs.length} active`}
              {activeJobs.length > 0 &&
                (completedJobs.length > 0 || failedJobs.length > 0) &&
                " • "}
              {completedJobs.length > 0 && `${completedJobs.length} completed`}
              {(activeJobs.length > 0 || completedJobs.length > 0) &&
                failedJobs.length > 0 &&
                " • "}
              {failedJobs.length > 0 && `${failedJobs.length} failed`}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {completedJobs.length > 0 && (
              <button
                onClick={clearCompleted}
                className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-700"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsMinimized(true)}
              className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              title="Minimize downloads"
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Premium Jobs List */}
        <div
          className={`max-h-96 overflow-y-auto ${isExpanded ? "max-h-none" : ""}`}
        >
          {jobs.map((job) => (
            <div
              key={job.jobId}
              className="border-b border-neutral-100/50 last:border-b-0"
            >
              <div className="space-y-3 p-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(job.status)}
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium text-neutral-900">
                          {job.trackName}
                        </h4>
                        <p className="truncate text-xs text-neutral-600">
                          {job.artistName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeJob(job.jobId)}
                    className="ml-3 flex-shrink-0 rounded-lg p-1 text-neutral-400 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-600"
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

                {/* Premium Progress Bar */}
                {job.status === "active" && (
                  <div className="space-y-2">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="progress-bar absolute top-0 left-0 h-2 rounded-full bg-blue-500"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-neutral-600">
                        {Math.round(job.progress)}%
                      </span>
                      <span className="text-neutral-500 capitalize">
                        {job.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status and Actions */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${getStatusColor(job.status)}`}
                  >
                    {job.status === "completed" && job.result
                      ? formatFileSize(job.result.fileSize)
                      : job.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    {job.status === "completed" && job.result?.downloadId && (
                      <button
                        onClick={() =>
                          triggerDownload(
                            job.result!.downloadId,
                            job.trackName,
                            job.artistName,
                          )
                        }
                        className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-neutral-800"
                        title="Download file"
                      >
                        Download
                      </button>
                    )}
                    {job.status === "failed" && (
                      <span
                        className="max-w-24 truncate text-xs text-red-500"
                        title={job.failedReason ?? job.error ?? "Failed"}
                      >
                        {job.failedReason ?? job.error ?? "Failed"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Footer */}
        {jobs.length > 3 && (
          <div className="border-t border-neutral-200/50 bg-white/50 px-6 py-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-center text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {isExpanded ? "Show less" : `Show all ${jobs.length} downloads`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
