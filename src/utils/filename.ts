/**
 * Utility functions for processing and sanitizing track filenames.
 */

/**
 * Extracts featured artists (feat./ft.) from a song title and merges them
 * into the artist list. Returns the updated artist array and the cleaned title
 * with the featuring clause removed.
 */
export function extractFeaturedArtists(
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

  // Merge featured artists with song artists without mutating the input
  const mergedArtists = [...songArtists];
  for (const artist of artists) {
    if (
      !mergedArtists.some(
        (existingArtist) =>
          existingArtist.toLowerCase() === artist.toLowerCase(),
      )
    ) {
      mergedArtists.push(artist);
    }
  }

  return [mergedArtists, title];
}

/**
 * Sanitizes a string for use in a track filename. Removes filesystem-illegal
 * characters and strips common YouTube metadata suffixes (e.g. "(Official
 * Video)", "- Lyrics", etc.).
 */
export function sanitizeTrackFilename(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/['']/g, "'")
    .replace(/&/g, "and")
    .replace(
      /\s*[\[(](official|audio|video|lyrics|lyric|visualizer|mv|music video|official music video|official video|hd|4k|8k)[^\])]*[\])]/gi,
      "",
    )
    .replace(
      /\s*[-–—]\s*(official|audio|video|lyrics|lyric|visualizer|mv|music video|official music video|official video|hd|4k|8k)\b.*$/i,
      "",
    )
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.+$/g, "");
}
