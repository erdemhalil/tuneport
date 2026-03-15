import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { TRPCError } from "@trpc/server";

vi.mock("~/server/queue/downloadQueue", () => ({
  getDownloadQueue: vi.fn(),
}));

vi.mock("~/server/services/redisService", () => ({
  removeDownloadedFile: vi.fn(),
}));

import {
  enqueueDownloads,
  getDownloadStatus,
  cleanupDownloads,
} from "~/server/services/downloadService";
import { getDownloadQueue } from "~/server/queue/downloadQueue";
import { removeDownloadedFile } from "~/server/services/redisService";

const mockedGetDownloadQueue = vi.mocked(getDownloadQueue);
const mockedRemoveDownloadedFile = vi.mocked(removeDownloadedFile);

describe("downloadService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("enqueueDownloads", () => {
    it("throws BAD_REQUEST when tracks array is empty", async () => {
      await expect(enqueueDownloads([], "user-1")).rejects.toMatchObject({
        code: "BAD_REQUEST",
      } satisfies Partial<TRPCError>);
    });

    it("throws BAD_REQUEST when more than 50 tracks are provided", async () => {
      const tracks = Array.from({ length: 51 }, (_, i) => ({
        videoId: `video-${i}`,
        trackName: `Track ${i}`,
        artistName: `Artist ${i}`,
      }));

      await expect(enqueueDownloads(tracks, "user-1")).rejects.toMatchObject({
        code: "BAD_REQUEST",
      } satisfies Partial<TRPCError>);
    });

    it("enqueues each track and returns created jobs", async () => {
      const add = vi.fn().mockResolvedValue(undefined);
      mockedGetDownloadQueue.mockReturnValue({ add } as unknown as ReturnType<
        typeof getDownloadQueue
      >);
      vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);

      const result = await enqueueDownloads(
        [
          {
            videoId: "video-1",
            trackName: "Song 1",
            artistName: "Artist 1",
            allArtists: ["Artist 1", "Artist 2"],
          },
        ],
        "user-1",
      );

      expect(add).toHaveBeenCalledTimes(1);
      expect(add).toHaveBeenCalledWith(
        "download-video-1",
        expect.objectContaining({
          videoId: "video-1",
          trackName: "Song 1",
          artistName: "Artist 1",
          userId: "user-1",
          jobId: "user-1-video-1-1700000000000",
        }),
        expect.objectContaining({
          jobId: "user-1-video-1-1700000000000",
        }),
      );

      expect(result).toEqual({
        message: "Added 1 tracks to download queue",
        jobs: [
          {
            jobId: "user-1-video-1-1700000000000",
            videoId: "video-1",
            trackName: "Song 1",
            artistName: "Artist 1",
            allArtists: ["Artist 1", "Artist 2"],
          },
        ],
      });
    });
  });

  describe("getDownloadStatus", () => {
    it("queries only user-owned job ids", async () => {
      const getJob = vi.fn().mockResolvedValue({
        getState: vi.fn().mockResolvedValue("completed"),
        progress: 100,
        returnvalue: {
          videoId: "video-1",
          trackName: "Track",
          artistName: "Artist",
          downloadId: "dl-1",
          fileSize: 123,
          duration: 180,
          success: true,
        },
        failedReason: undefined,
      });

      mockedGetDownloadQueue.mockReturnValue({
        getJob,
      } as unknown as ReturnType<typeof getDownloadQueue>);

      const result = await getDownloadStatus(
        ["user-1-video-1-1", "another-user-video-2-2"],
        "user-1",
      );

      expect(getJob).toHaveBeenCalledTimes(1);
      expect(getJob).toHaveBeenCalledWith("user-1-video-1-1");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        jobId: "user-1-video-1-1",
        status: "completed",
      });
    });
  });

  describe("cleanupDownloads", () => {
    it("removes only user-owned download ids", async () => {
      mockedRemoveDownloadedFile
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result = await cleanupDownloads(
        ["user-1-video-1-1", "not-owner-video-2-2", "user-1-video-3-3"],
        "user-1",
      );

      expect(mockedRemoveDownloadedFile).toHaveBeenCalledTimes(2);
      expect(mockedRemoveDownloadedFile).toHaveBeenNthCalledWith(
        1,
        "user-1-video-1-1",
      );
      expect(mockedRemoveDownloadedFile).toHaveBeenNthCalledWith(
        2,
        "user-1-video-3-3",
      );
      expect(result).toEqual({ cleaned: 1 });
    });
  });
});
