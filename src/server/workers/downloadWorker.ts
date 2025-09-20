import { Worker, type Job } from "bullmq";
import { spawn } from "child_process";
import { promisify } from "util";
import { exec as execCallback } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
import { readFile, unlink } from "fs/promises";
import { storeDownloadedFile } from "../services/redisService";
import type { DownloadJobData, DownloadResult } from "../queue/types";
import { redisConnection } from "../lib/redis";

const exec = promisify(execCallback);

const downloadWorker = new Worker(
  "youtube-downloads",
  async (job: Job<DownloadJobData>): Promise<DownloadResult> => {
    const { videoId, trackName, artistName, allArtists, userId } = job.data;

    try {
      // Update job progress
      await job.updateProgress(10);

      // Process song name and extract featured artists
      function processSpotifySongName(
        songArtists: string[],
        songTitle: string,
      ): [string[], string] {
        const artists: string[] = [];
        const featStrings = [" feat.", " ft.", "(feat.", "(ft."];

        let title = songTitle;

        for (const featString of featStrings) {
          if (songTitle.toLowerCase().includes(featString.toLowerCase())) {
            const regex = new RegExp(
              featString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              "i",
            );
            const parts = songTitle.split(regex);

            if (parts.length > 1) {
              title = parts[0]!.trim();
              const featuredPart = parts[1]!;

              // Split by ", " or "& " to get individual artists
              const featuredArtists = featuredPart
                .replace(/[)]/g, "") // Remove closing parenthesis
                .split(/,\s*|&\s*/) // Split by comma or ampersand
                .map((artist) => artist.trim())
                .filter((artist) => artist.length > 0);

              artists.push(...featuredArtists);
              break; // Only process first feat string found
            }
          }
        }

        // If no featured artists found, use original title
        if (artists.length === 0) {
          title = songTitle;
        }

        // Add featured artists to song artists if not already present
        for (const artist of artists) {
          if (
            !songArtists.some(
              (existingArtist) =>
                existingArtist.toLowerCase() === artist.toLowerCase(),
            )
          ) {
            songArtists.push(artist);
          }
        }

        return [songArtists, title];
      }

      // Get all artists (start with Spotify artists or fallback to single artist)
      const initialArtists =
        allArtists && allArtists.length > 0 ? [...allArtists] : [artistName];
      const [finalArtists, processedTitle] = processSpotifySongName(
        initialArtists,
        trackName,
      );

      // Create filename with all artists
      const safeTrackName = processedTitle
        .replace(/:/g, "")
        .replace(/&/g, "and")
        .trim();
      const safeArtists = finalArtists
        .map((artist) => artist.replace(/:/g, "").replace(/&/g, "and").trim())
        .join(", ");
      const filename = `${safeArtists} - ${safeTrackName}.mp3`;

      // Update progress
      await job.updateProgress(20);

      // Use yt-dlp directly via child_process for better reliability
      const downloadUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // First, get video info to check if it's available
      try {
        await exec(`yt-dlp --no-download --print-json "${downloadUrl}"`, {
          timeout: 30000,
        });
      } catch (infoError) {
        const errorMessage =
          infoError instanceof Error ? infoError.message : String(infoError);
        throw new Error(
          `Video unavailable or yt-dlp not found: ${errorMessage}`,
        );
      }

      // Download the video as MP3 to a buffer using yt-dlp
      let totalSize = 0;

      // Create a temporary file path for download
      const tempDir = tmpdir();
      const tempFilePath = join(
        tempDir,
        `download-${videoId}-${Date.now()}.mp3`,
      );

      // Use spawn to download to a temporary file (ensures proper audio extraction)
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
          tempFilePath, // Output to temporary file
          downloadUrl,
        ],
        {
          stdio: ["pipe", "pipe", "pipe"],
        },
      );

      let downloadTimeout: NodeJS.Timeout;

      // Track download progress (yt-dlp doesn't provide real-time progress to stdout for audio extraction)
      // We'll use a simple progress simulation
      let currentProgress = 20;

      const progressInterval = setInterval(() => {
        if (currentProgress < 90) {
          currentProgress += Math.random() * 5; // Simulate progress
          void job.updateProgress(Math.min(currentProgress, 90));
        }
      }, 2000);

      // Wait for download to complete with timeout
      const downloadPromise = new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          if (progressInterval) clearInterval(progressInterval);
          if (downloadTimeout) clearTimeout(downloadTimeout);
          ytDlpProcess.kill("SIGTERM");
        };

        ytDlpProcess.on("close", (code) => {
          console.log(
            `yt-dlp process exited with code ${code} for ${trackName}`,
          );
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

        // Also listen for stderr for error messages
        ytDlpProcess.stderr.on("data", (data: Buffer) => {
          const errorOutput = data.toString();
          console.warn(`yt-dlp stderr for ${trackName}:`, errorOutput);
        });
      });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        downloadTimeout = setTimeout(() => {
          console.error(
            `⏱️ Download timeout for ${trackName} after 1 minute 30 seconds`,
          );
          ytDlpProcess.kill("SIGTERM");
          reject(
            new Error(
              `Download timeout after 1 minute 30 seconds - ${trackName} may be unavailable or too large`,
            ),
          );
        }, 90 * 1000); // 1 minute 30 seconds timeout
      });

      // Race between download completion and timeout
      await Promise.race([downloadPromise, timeoutPromise]);

      // Read the downloaded file
      const buffer = await readFile(tempFilePath);
      totalSize = buffer.length;

      // Clean up temporary file
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn(
          `Failed to clean up temporary file ${tempFilePath}:`,
          cleanupError,
        );
      }

      // Check if we actually received data
      if (totalSize === 0) {
        throw new Error("No data received from yt-dlp process");
      }

      console.log(
        `Download completed for ${trackName}, file size: ${totalSize} bytes`,
      );

      // Generate unique download ID
      const downloadId = `${userId}-${videoId}-${Date.now()}`;

      // Store file data in Redis
      await storeDownloadedFile(downloadId, buffer, filename);

      console.log(
        `✅ Download completed and stored in Redis: ${downloadId}, size: ${totalSize} bytes`,
      );

      return {
        videoId,
        trackName,
        artistName,
        downloadId,
        fileSize: totalSize,
        duration: 0, // Could be extracted from metadata if needed
        success: true,
      } as DownloadResult;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `❌ Download failed for ${videoId} (${trackName}):`,
        errorMessage,
      );

      // Make sure to update progress to show failure - but don't reset to 0
      try {
        await job.updateProgress(0);
      } catch (progressError) {
        console.warn("Failed to update job progress:", progressError);
      }

      // Throw the error to make BullMQ mark the job as failed
      throw new Error(`Download failed: ${errorMessage}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 8, // Process up to 8 downloads simultaneously
  },
);

// Export the worker for initialization
export default downloadWorker;
