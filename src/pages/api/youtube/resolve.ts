import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authConfig } from "~/server/auth/config";
import { YouTubeService } from "~/server/services/youtubeService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authConfig);
  if (!session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const videoId = req.query.videoId;
  if (!videoId || typeof videoId !== "string") {
    return res.status(400).json({ message: "Missing videoId" });
  }

  try {
    const youtubeService = new YouTubeService(session);
    const match = await youtubeService.resolveVideoById(videoId);

    if (!match) {
      return res.status(404).json({ message: "Video not found" });
    }

    return res.status(200).json({ match });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
