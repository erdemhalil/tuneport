import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "~/utils/api";
import type { DownloadJob } from "~/utils/types";

interface DownloadContextType {
  jobs: DownloadJob[];
  addJobs: (
    jobs: Array<{
      jobId: string;
      videoId: string;
      trackName: string;
      artistName: string;
      allArtists?: string[];
      artwork?: string;
    }>,
  ) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(
  undefined,
);

export function DownloadProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [jobIds, setJobIds] = useState<string[]>([]);

  const statusQuery = api.youtube.getDownloadStatus.useQuery(
    { jobIds },
    {
      enabled: jobIds.length > 0,
      refetchInterval: 2000,
    },
  );

  useEffect(() => {
    if (statusQuery.data) {
      setJobs((currentJobs) =>
        currentJobs.map((job) => {
          const updatedJob = statusQuery.data.find(
            (j) => j.jobId === job.jobId,
          );
          if (updatedJob) {
            return {
              ...job,
              status: updatedJob.status,
              progress: updatedJob.progress,
              result: updatedJob.result,
              failedReason: updatedJob.failedReason,
              error: updatedJob.error,
            };
          }
          return job;
        }),
      );
    }
  }, [statusQuery.data]);

  const addJobs = (
    newJobs: Array<{
      jobId: string;
      videoId: string;
      trackName: string;
      artistName: string;
      allArtists?: string[];
      artwork?: string;
    }>,
  ) => {
    const jobsToAdd = newJobs.map((job) => ({
      ...job,
      status: "waiting" as const,
      progress: 0,
    }));

    setJobs((current) => [...current, ...jobsToAdd]);
    setJobIds((current) => [...current, ...newJobs.map((j) => j.jobId)]);
  };

  const removeJob = (jobId: string) => {
    setJobs((current) => current.filter((job) => job.jobId !== jobId));
    setJobIds((current) => current.filter((id) => id !== jobId));
  };

  const clearCompleted = () => {
    setJobs((current) =>
      current.filter((job) => !["completed", "failed"].includes(job.status)),
    );
    setJobIds((current) => {
      const completedJobIds = jobs
        .filter((job) => ["completed", "failed"].includes(job.status))
        .map((job) => job.jobId);
      return current.filter((id) => !completedJobIds.includes(id));
    });
  };

  return (
    <DownloadContext.Provider
      value={{ jobs, addJobs, removeJob, clearCompleted }}
    >
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownloads() {
  const context = useContext(DownloadContext);
  if (context === undefined) {
    throw new Error("useDownloads must be used within a DownloadProvider");
  }
  return context;
}
