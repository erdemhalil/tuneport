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

  const query = req.query.q;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ message: "Missing search query" });
  }

  const limitParam = req.query.limit;
  const parsedLimit =
    typeof limitParam === "string" ? Number.parseInt(limitParam, 10) : 8;
  const maxResults = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 15)
    : 8;

  try {
    const youtubeService = new YouTubeService(session);
    const result = await youtubeService.searchByQuery(query, maxResults);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
