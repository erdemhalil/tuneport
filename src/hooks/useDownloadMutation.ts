import { api } from "~/utils/api";
import { useDownloads } from "~/contexts/DownloadContext";

interface JobEnrichment {
  allArtists?: string[];
  artwork?: string;
}

/**
 * Shared hook for the download mutation lifecycle.
 *
 * Encapsulates the tRPC `downloadTracks` mutation, the `onSuccess` job-mapping
 * that registers jobs in the DownloadContext, and the `onError` alert.
 *
 * @param enrichJob - callback to enrich each returned job with artwork/allArtists
 *   from the caller's local data (Spotify tracks, YouTube matches, etc.)
 */
export function useDownloadMutation(
  enrichJob: (job: {
    videoId: string;
    trackName: string;
    artistName: string;
  }) => JobEnrichment,
) {
  const { addJobs } = useDownloads();

  const mutation = api.youtube.downloadTracks.useMutation({
    onSuccess: (data) => {
      const validJobs = data.jobs
        .filter((job) => job.jobId)
        .map((job) => {
          const extra = enrichJob(job);
          return {
            jobId: job.jobId,
            videoId: job.videoId,
            trackName: job.trackName,
            artistName: job.artistName,
            allArtists: job.allArtists ?? extra.allArtists ?? [job.artistName],
            artwork: extra.artwork,
          };
        });
      addJobs(validJobs);
    },
    onError: (error) => {
      alert(`Download failed: ${error.message}`);
    },
  });

  return mutation;
}
