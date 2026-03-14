import { getRedisConnection } from "~/server/lib/redis";
import { isOwnedByUser } from "~/utils/types";

function getDownloadFileKey(downloadId: string): string {
  return `download:file:${downloadId}`;
}

interface RedisFileData {
  buffer: string;
  filename: string;
  mimeType: string;
  size: number;
  timestamp: number;
}

export interface DownloadFileResult {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
  timestamp: number;
}

/**
 * Retrieve a downloaded file from Redis.
 * Returns null if the file is not found, expired, or on Redis error.
 * @throws never — errors are logged and swallowed.
 */
export async function getDownloadedFile(
  downloadId: string,
  userId: string,
): Promise<DownloadFileResult | null> {
  if (!isOwnedByUser(downloadId, userId)) return null;

  try {
    const data = await getRedisConnection().get(getDownloadFileKey(downloadId));
    if (!data) return null;

    const fileData = JSON.parse(data) as RedisFileData;
    const buffer = Buffer.from(fileData.buffer, "base64");

    return {
      buffer,
      filename: fileData.filename,
      mimeType: fileData.mimeType,
      size: fileData.size,
      timestamp: fileData.timestamp,
    };
  } catch (error) {
    console.error("Error retrieving file from Redis:", error);
    return null;
  }
}

/**
 * Store a downloaded file in Redis with a 1-hour TTL.
 * Returns true on success, false on error.
 * @throws never — errors are logged and swallowed.
 */
export async function storeDownloadedFile(
  downloadId: string,
  buffer: Buffer,
  filename: string,
  mimeType = "audio/mpeg",
): Promise<boolean> {
  try {
    const fileData: RedisFileData = {
      buffer: buffer.toString("base64"),
      filename,
      mimeType,
      size: buffer.length,
      timestamp: Date.now(),
    };

    await getRedisConnection().setex(
      getDownloadFileKey(downloadId),
      3600, // 1 hour TTL
      JSON.stringify(fileData),
    );
    return true;
  } catch (error) {
    console.error("Error storing file in Redis:", error);
    return false;
  }
}

/**
 * Remove a downloaded file from Redis.
 * Returns true if the file was deleted, false if not found or on error.
 * @throws never — errors are logged and swallowed.
 */
export async function removeDownloadedFile(
  downloadId: string,
): Promise<boolean> {
  try {
    const result = await getRedisConnection().del(
      getDownloadFileKey(downloadId),
    );
    return result > 0;
  } catch (error) {
    console.error("Error removing file from Redis:", error);
    return false;
  }
}
