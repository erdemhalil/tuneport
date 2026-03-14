import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "~/server/auth/config";
import { getDownloadedFile } from "~/server/services/redisService";

export const config = {
  api: {
    responseLimit: false, // Disable 4MB response size limit for file downloads
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { downloadId } = req.query;

    if (!downloadId || typeof downloadId !== "string") {
      return res.status(400).json({ error: "Missing downloadId parameter" });
    }

    // Ownership is verified inside getDownloadedFile
    const fileData = await getDownloadedFile(downloadId, session.user.id);

    if (!fileData) {
      return res.status(404).json({ error: "File not found or access denied" });
    }

    res.setHeader("Content-Type", fileData.mimeType);
    res.setHeader("Content-Length", fileData.size);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(fileData.filename)}`,
    );
    res.setHeader(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.send(fileData.buffer);
  } catch (error) {
    const context =
      error instanceof Error ? error.message : "Unknown error type";
    console.error("Download API error:", {
      context,
      downloadId: req.query.downloadId,
    });
    res.status(500).json({ error: "Internal server error" });
  }
}
