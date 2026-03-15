import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import { promisify } from "util";
import { exec as execCallback } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
import { readFile, unlink } from "fs/promises";
import { storeDownloadedFile } from "../services/redisService";
import type { DownloadJobData, DownloadResult } from "../queue/types";
import { createDownloadId } from "~/utils/types";
import { getRedisConnection } from "../lib/redis";
import {
  extractFeaturedArtists,
  sanitizeTrackFilename,
} from "~/utils/filename";

const exec = promisify(execCallback);

const DOWNLOAD_TIMEOUT_MS = 90_000;

function buildFilename(data: DownloadJobData): string {
  const { trackName, artistName, allArtists, useArtistInFilename } = data;
  const initialArtists =
    allArtists && allArtists.length > 0 ? [...allArtists] : [artistName];
  const [finalArtists, processedTitle] = extractFeaturedArtists(
    initialArtists,
    trackName,
  );

  const safeTrackName = sanitizeTrackFilename(processedTitle);
  const safeArtists = finalArtists
    .map((artist) => sanitizeTrackFilename(artist))
    .filter((artist) => artist.length > 0)
    .join(", ");

  const includeArtist = useArtistInFilename ?? true;
  return includeArtist && safeArtists.length > 0
    ? `${safeArtists} - ${safeTrackName}.mp3`
    : `${safeTrackName}.mp3`;
}

async function verifyVideoAvailability(downloadUrl: string): Promise<void> {
  try {
    await exec(`yt-dlp --no-download --print-json "${downloadUrl}"`, {
      timeout: 30000,
    });
  } catch (infoError) {
    const message =
      infoError instanceof Error ? infoError.message : String(infoError);
    throw new Error(`Video unavailable or yt-dlp not found: ${message}`, {
      cause: infoError,
    });
  }
}

function downloadWithYtDlp(
  downloadUrl: string,
  tempFilePath: string,
  trackName: string,
  onProgress: (phase: number) => void,
): Promise<void> {
  const ytDlpProcess = spawn(
    "yt-dlp",
    [
      "--format",
      "bestaudio/best",
      "--extract-audio",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "320K",
      "--no-playlist",
      "-o",
      tempFilePath,
      downloadUrl,
    ],
    { stdio: ["pipe", "pipe", "pipe"] },
  );

  return raceWithTimeout(ytDlpProcess, trackName, onProgress);
}

function raceWithTimeout(
  ytDlpProcess: ChildProcessWithoutNullStreams,
  trackName: string,
  onProgress: (phase: number) => void,
): Promise<void> {
  let downloadTimeout: NodeJS.Timeout;
  let phaseProgress = 40;

  // Fixed phase milestones instead of random increments
  const progressInterval = setInterval(() => {
    if (phaseProgress < 85) {
      phaseProgress = Math.min(phaseProgress + 10, 85);
      onProgress(phaseProgress);
    }
  }, 3000);

  const downloadPromise = new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearInterval(progressInterval);
      clearTimeout(downloadTimeout);
      if (!ytDlpProcess.killed) {
        ytDlpProcess.kill("SIGTERM");
      }
    };

    ytDlpProcess.on("close", (code) => {
      cleanup();
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });

    ytDlpProcess.on("error", (error: Error) => {
      console.error(`yt-dlp process error for ${trackName}:`, error);
      cleanup();
      reject(error);
    });

    ytDlpProcess.stderr.on("data", (data: Buffer) => {
      console.warn(`yt-dlp stderr for ${trackName}:`, data.toString());
    });
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    downloadTimeout = setTimeout(() => {
      console.error(
        `Download timeout for ${trackName} after ${DOWNLOAD_TIMEOUT_MS / 1000}s`,
      );
      ytDlpProcess.kill("SIGTERM");
      reject(
        new Error(
          `Download timeout after ${DOWNLOAD_TIMEOUT_MS / 1000}s - ${trackName} may be unavailable or too large`,
        ),
      );
    }, DOWNLOAD_TIMEOUT_MS);
  });

  return Promise.race([downloadPromise, timeoutPromise]);
}

async function readAndCleanupTempFile(tempFilePath: string): Promise<Buffer> {
  const buffer = await readFile(tempFilePath);

  try {
    await unlink(tempFilePath);
  } catch (cleanupError) {
    console.warn(
      `Failed to clean up temporary file ${tempFilePath}:`,
      cleanupError,
    );
  }

  if (buffer.length === 0) {
    throw new Error("No data received from yt-dlp process");
  }

  return buffer;
}

async function storeResult(
  userId: string,
  videoId: string,
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const downloadId = createDownloadId(userId, videoId);
  const stored = await storeDownloadedFile(downloadId, buffer, filename);
  if (!stored) {
    throw new Error("Failed to store downloaded file in Redis");
  }
  return downloadId;
}

let _worker: Worker | null = null;

/**
 * Lazy BullMQ worker getter. Defers Worker instantiation until first use,
 * preventing network connections at import time. Event handlers are registered
 * in `server/init.ts`.
 */
export function getDownloadWorker(): Worker {
  if (_worker) return _worker;

  _worker = new Worker(
    "youtube-downloads",
    async (job: Job<DownloadJobData>): Promise<DownloadResult> => {
      const { videoId, trackName, artistName, userId } = job.data;

      try {
        // Phase 1: Build filename (10%)
        await job.updateProgress(10);
        const filename = buildFilename(job.data);

        // Phase 2: Verify video availability (20%)
        await job.updateProgress(20);
        const downloadUrl = `https://www.youtube.com/watch?v=${videoId}`;
        await verifyVideoAvailability(downloadUrl);

        // Phase 3: Download with yt-dlp (30-85%)
        await job.updateProgress(30);
        const tempFilePath = join(
          tmpdir(),
          `download-${videoId}-${Date.now()}.mp3`,
        );
        await downloadWithYtDlp(
          downloadUrl,
          tempFilePath,
          trackName,
          (phase) => void job.updateProgress(phase),
        );

        // Phase 4: Read file and cleanup (90%)
        await job.updateProgress(90);
        const buffer = await readAndCleanupTempFile(tempFilePath);

        // Phase 5: Store in Redis (95%)
        await job.updateProgress(95);
        const downloadId = await storeResult(userId, videoId, buffer, filename);

        return {
          videoId,
          trackName,
          artistName,
          downloadId,
          fileSize: buffer.length,
          duration: 0,
          success: true,
        } satisfies DownloadResult;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `Download failed for ${videoId} (${trackName}):`,
          errorMessage,
        );

        try {
          await job.updateProgress(0);
        } catch (progressError) {
          console.warn("Failed to update job progress:", progressError);
        }

        throw new Error(`Download failed: ${errorMessage}`, { cause: error });
      }
    },
    {
      connection: getRedisConnection() as unknown as ConnectionOptions,
      concurrency: 8,
    },
  );

  return _worker;
}
