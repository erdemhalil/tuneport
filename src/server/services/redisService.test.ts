import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("~/server/lib/redis", () => ({
  getRedisConnection: vi.fn(),
}));

import {
  getDownloadedFile,
  storeDownloadedFile,
  removeDownloadedFile,
} from "~/server/services/redisService";
import { getRedisConnection } from "~/server/lib/redis";

const mockedGetRedisConnection = vi.mocked(getRedisConnection);

describe("redisService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getDownloadedFile", () => {
    it("returns null when download id does not belong to user", async () => {
      const get = vi.fn();
      mockedGetRedisConnection.mockReturnValue({ get } as never);

      const result = await getDownloadedFile("user-2-video-1-1", "user-1");

      expect(result).toBeNull();
      expect(get).not.toHaveBeenCalled();
    });

    it("returns decoded file when key exists", async () => {
      const buffer = Buffer.from("mp3-bytes");
      const payload = JSON.stringify({
        buffer: buffer.toString("base64"),
        filename: "song.mp3",
        mimeType: "audio/mpeg",
        size: buffer.length,
        timestamp: 123,
      });
      const get = vi.fn().mockResolvedValue(payload);
      mockedGetRedisConnection.mockReturnValue({ get } as never);

      const result = await getDownloadedFile("user-1-video-1-1", "user-1");

      expect(get).toHaveBeenCalledWith("download:file:user-1-video-1-1");
      expect(result).toEqual({
        buffer,
        filename: "song.mp3",
        mimeType: "audio/mpeg",
        size: buffer.length,
        timestamp: 123,
      });
    });

    it("swallows redis/json errors and returns null", async () => {
      const get = vi.fn().mockRejectedValue(new Error("redis down"));
      mockedGetRedisConnection.mockReturnValue({ get } as never);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        return;
      });

      const result = await getDownloadedFile("user-1-video-1-1", "user-1");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("storeDownloadedFile", () => {
    it("stores base64 payload with one-hour ttl", async () => {
      const setex = vi.fn().mockResolvedValue("OK");
      mockedGetRedisConnection.mockReturnValue({ setex } as never);
      vi.spyOn(Date, "now").mockReturnValue(777);

      const buffer = Buffer.from("audio-data");
      const ok = await storeDownloadedFile(
        "user-1-video-1-1",
        buffer,
        "song.mp3",
      );

      expect(ok).toBe(true);
      expect(setex).toHaveBeenCalledTimes(1);
      expect(setex).toHaveBeenCalledWith(
        "download:file:user-1-video-1-1",
        3600,
        expect.stringContaining('"filename":"song.mp3"'),
      );
      const serialized = setex.mock.calls[0]?.[2] as string;
      const parsed = JSON.parse(serialized) as {
        buffer: string;
        timestamp: number;
      };
      expect(parsed.buffer).toBe(buffer.toString("base64"));
      expect(parsed.timestamp).toBe(777);
    });

    it("returns false when redis write fails", async () => {
      const setex = vi.fn().mockRejectedValue(new Error("write failed"));
      mockedGetRedisConnection.mockReturnValue({ setex } as never);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        return;
      });

      const ok = await storeDownloadedFile(
        "user-1-video-1-1",
        Buffer.from("audio-data"),
        "song.mp3",
      );

      expect(ok).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("removeDownloadedFile", () => {
    it("returns true when redis deletes at least one key", async () => {
      const del = vi.fn().mockResolvedValue(1);
      mockedGetRedisConnection.mockReturnValue({ del } as never);

      const ok = await removeDownloadedFile("user-1-video-1-1");

      expect(ok).toBe(true);
      expect(del).toHaveBeenCalledWith("download:file:user-1-video-1-1");
    });

    it("returns false when redis delete throws", async () => {
      const del = vi.fn().mockRejectedValue(new Error("delete failed"));
      mockedGetRedisConnection.mockReturnValue({ del } as never);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        return;
      });

      const ok = await removeDownloadedFile("user-1-video-1-1");

      expect(ok).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
