export const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function isYouTubeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return YOUTUBE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function extractYouTubeVideoId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (VIDEO_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (!YOUTUBE_HOSTS.has(url.hostname)) return null;

    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      if (!id) return null;
      return VIDEO_ID_PATTERN.test(id) ? id : null;
    }

    const vParam = url.searchParams.get("v");
    if (vParam && VIDEO_ID_PATTERN.test(vParam)) {
      return vParam;
    }

    const pathParts = url.pathname.split("/").filter(Boolean);
    const embedIndex = pathParts.findIndex(
      (part) => part === "embed" || part === "shorts" || part === "v",
    );
    if (embedIndex !== -1) {
      const id = pathParts[embedIndex + 1];
      if (!id) return null;
      return VIDEO_ID_PATTERN.test(id) ? id : null;
    }
  } catch {
    return null;
  }

  return null;
}
