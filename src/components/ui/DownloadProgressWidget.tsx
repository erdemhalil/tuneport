import { useState, useEffect } from "react";
import { useDownloads } from "~/contexts/DownloadContext";
import { triggerBrowserDownload } from "~/utils/download";
import { JobItem } from "./JobItem";

export function DownloadProgressWidget() {
  const { jobs, removeJob, clearCompleted } = useDownloads();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloadedJobs, setDownloadedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    jobs.forEach((job) => {
      if (
        job.status === "completed" &&
        job.result?.downloadId &&
        !downloadedJobs.has(job.jobId)
      ) {
        triggerBrowserDownload(
          `/api/download/${job.result.downloadId}`,
          `${job.artistName} - ${job.trackName}.mp3`,
        );
        setDownloadedJobs((prev) => new Set(prev).add(job.jobId));
      }
    });
  }, [jobs, downloadedJobs]);

  const handleClearCompleted = () => {
    const completedIds = new Set(
      jobs.filter((j) => j.status === "completed").map((j) => j.jobId),
    );
    setDownloadedJobs((prev) => {
      const pruned = new Set<string>();
      for (const id of prev) {
        if (!completedIds.has(id)) pruned.add(id);
      }
      return pruned;
    });
    clearCompleted();
  };

  if (jobs.length === 0) {
    return null;
  }

  const activeJobs = jobs.filter(
    (job) => !["completed", "failed"].includes(job.status),
  );
  const completedJobs = jobs.filter((job) => job.status === "completed");
  const failedJobs = jobs.filter((job) => job.status === "failed");

  if (isMinimized) {
    return (
      <div className="animate-scale-in fixed right-6 bottom-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="group border-edge-strong bg-elevated hover:bg-surface-hover flex w-72 items-center justify-between rounded-xl border px-4 py-2.5 transition-colors"
          aria-label="Expand downloads panel"
          title="Expand downloads"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-sky-600"></div>
              {activeJobs.length > 0 && (
                <div className="border-elevated absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border bg-emerald-500"></div>
              )}
            </div>
            <div className="flex min-w-0 flex-col items-start justify-center leading-tight">
              <div className="text-primary text-sm font-semibold">
                Downloads
              </div>
              <div className="text-secondary text-xs">
                {activeJobs.length > 0
                  ? `${activeJobs.length} active`
                  : `${jobs.length} total`}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <svg
              className="text-muted group-hover:text-primary h-6 w-6 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 14l5-5 5 5"
              />
            </svg>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="animate-scale-in fixed right-6 bottom-6 z-50 w-88">
      <div className="border-edge-strong bg-surface overflow-hidden rounded-xl border shadow-xl shadow-black/10">
        {/* Header */}
        <div className="border-edge bg-elevated flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="border-edge bg-inset flex h-10 w-10 items-center justify-center rounded-lg border">
                <svg
                  className="h-5 w-5 text-sky-500"
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
              </div>
              {activeJobs.length > 0 && (
                <div className="border-elevated absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 bg-emerald-500"></div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-primary text-base font-semibold">
                Downloads
              </h3>
              <div className="text-secondary text-sm">
                {[
                  activeJobs.length > 0 && (
                    <span key="active" className="font-medium text-sky-500">
                      {activeJobs.length} active
                    </span>
                  ),
                  completedJobs.length > 0 && (
                    <span
                      key="completed"
                      className="font-medium text-emerald-500"
                    >
                      {completedJobs.length} completed
                    </span>
                  ),
                  failedJobs.length > 0 && (
                    <span key="failed" className="font-medium text-rose-400">
                      {failedJobs.length} failed
                    </span>
                  ),
                ]
                  .filter(Boolean)
                  .flatMap((el, i) =>
                    i > 0 ? [<span key={`sep-${i}`}> &bull; </span>, el] : [el],
                  )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {completedJobs.length > 0 && (
              <button
                onClick={handleClearCompleted}
                className="border-edge bg-inset text-secondary hover:bg-surface-hover hover:text-primary inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
                title="Clear completed downloads"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={() => setIsMinimized(true)}
              className="border-edge bg-inset text-secondary hover:bg-surface-hover hover:text-primary inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
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

        {/* Jobs List */}
        <div
          className={`overflow-y-auto ${isExpanded ? "max-h-none" : "max-h-125"}`}
        >
          {jobs.map((job) => (
            <JobItem
              key={job.jobId}
              job={job}
              onRemove={() => removeJob(job.jobId)}
              onDownload={
                job.status === "completed" && job.result?.downloadId
                  ? () =>
                      triggerBrowserDownload(
                        `/api/download/${job.result?.downloadId}`,
                        job.trackName && job.artistName
                          ? `${job.artistName} - ${job.trackName}.mp3`
                          : undefined,
                      )
                  : undefined
              }
            />
          ))}
        </div>

        {/* Footer */}
        {jobs.length > 3 && (
          <div className="border-edge bg-elevated border-t px-5 py-2.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group text-secondary hover:text-primary flex w-full items-center justify-center gap-2 text-xs font-medium transition-colors"
              title={isExpanded ? "Collapse downloads" : "Expand downloads"}
              aria-label={
                isExpanded ? "Collapse downloads" : "Expand downloads"
              }
            >
              <span>
                {isExpanded ? "Show less" : `Show all ${jobs.length} downloads`}
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : "rotate-0"}`}
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
        )}
      </div>
    </div>
  );
}
