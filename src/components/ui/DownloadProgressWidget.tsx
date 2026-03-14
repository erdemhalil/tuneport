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
          className="glass group flex w-80 items-center justify-between rounded-2xl border border-white/20 px-6 py-4 shadow-lg transition-all duration-200 hover:border-purple-400/40 hover:shadow-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-4 w-4 animate-pulse rounded-full bg-blue-400"></div>
              {activeJobs.length > 0 && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400"></div>
              )}
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-white">Downloads</div>
              <div className="text-xs text-neutral-300">
                {activeJobs.length > 0
                  ? `${activeJobs.length} active`
                  : `${jobs.length} total`}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300">
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/20 bg-white/10 px-6 py-5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/30 ring-1 ring-purple-500/20">
                <svg
                  className="h-6 w-6 text-purple-300"
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
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white/20 bg-emerald-400"></div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Downloads</h3>
              <div className="text-sm text-neutral-300">
                {[
                  activeJobs.length > 0 && (
                    <span key="active" className="font-medium text-blue-400">
                      {activeJobs.length} active
                    </span>
                  ),
                  completedJobs.length > 0 && (
                    <span
                      key="completed"
                      className="font-medium text-emerald-400"
                    >
                      {completedJobs.length} completed
                    </span>
                  ),
                  failedJobs.length > 0 && (
                    <span key="failed" className="font-medium text-red-400">
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
                className="inline-flex items-center justify-center rounded-xl bg-white/10 p-2.5 text-neutral-300 transition-all duration-200 hover:bg-white/20 hover:text-white"
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
              className="inline-flex items-center justify-center rounded-xl bg-white/10 p-2.5 text-neutral-300 transition-all duration-200 hover:bg-white/20 hover:text-white"
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
          className={`overflow-y-auto ${isExpanded ? "max-h-none" : "max-h-[500px]"}`}
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
