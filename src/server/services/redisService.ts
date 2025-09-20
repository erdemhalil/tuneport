import IORedis from "ioredis";
import { env } from "~/env";

export const redisConnection = new IORedis({
  host: env.REDIS_HOST ?? "localhost",
  port: parseInt(env.REDIS_PORT ?? "6379"),
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

const DOWNLOAD_FILE_KEY = (downloadId: string) => `download:file:${downloadId}`;

export interface RedisFileData {
  buffer: string; // base64 encoded
  filename: string;
  mimeType: string;
  size: number;
  timestamp: number;
}

export async function getDownloadedFile(downloadId: string) {
  try {
    const data = await redisConnection.get(DOWNLOAD_FILE_KEY(downloadId));
    if (!data) return null;

    // Type assertion for JSON.parse
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

export async function storeDownloadedFile(
  downloadId: string,
  buffer: Buffer,
  filename: string,
  mimeType = "audio/mpeg",
) {
  const fileData: RedisFileData = {
    buffer: buffer.toString("base64"),
    filename,
    mimeType,
    size: buffer.length,
    timestamp: Date.now(),
  };

  await redisConnection.setex(
    DOWNLOAD_FILE_KEY(downloadId),
    3600, // 1 hour TTL
    JSON.stringify(fileData),
  );
}

export async function removeDownloadedFile(downloadId: string) {
  try {
    const result = await redisConnection.del(DOWNLOAD_FILE_KEY(downloadId));
    return result > 0;
  } catch (error) {
    console.error("Error removing file from Redis:", error);
    return false;
  }
}
