import { describe, it, expect } from "vitest";
import { isYouTubeUrl, extractYouTubeVideoId } from "./youtube";

describe("isYouTubeUrl", () => {
  it("accepts standard youtube.com URLs", () => {
    expect(isYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      true,
    );
    expect(isYouTubeUrl("https://youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
  });

  it("accepts mobile and music youtube URLs", () => {
    expect(isYouTubeUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      true,
    );
    expect(isYouTubeUrl("https://music.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      true,
    );
  });

  it("accepts youtu.be short URLs", () => {
    expect(isYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
  });

  it("accepts youtube-nocookie.com URLs", () => {
    expect(
      isYouTubeUrl("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
    ).toBe(true);
    expect(isYouTubeUrl("https://youtube-nocookie.com/embed/dQw4w9WgXcQ")).toBe(
      true,
    );
  });

  it("rejects non-YouTube URLs", () => {
    expect(isYouTubeUrl("https://www.google.com")).toBe(false);
    expect(isYouTubeUrl("https://vimeo.com/12345")).toBe(false);
    expect(isYouTubeUrl("https://notyoutube.com/watch?v=abc")).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(isYouTubeUrl("not a url")).toBe(false);
    expect(isYouTubeUrl("")).toBe(false);
    expect(isYouTubeUrl("ftp://youtube.com")).toBe(true); // URL parses, hostname matches
  });
});

describe("extractYouTubeVideoId", () => {
  const VALID_ID = "dQw4w9WgXcQ";

  it("extracts ID from standard watch URLs", () => {
    expect(
      extractYouTubeVideoId(`https://www.youtube.com/watch?v=${VALID_ID}`),
    ).toBe(VALID_ID);
    expect(
      extractYouTubeVideoId(`https://youtube.com/watch?v=${VALID_ID}`),
    ).toBe(VALID_ID);
  });

  it("extracts ID from youtu.be short URLs", () => {
    expect(extractYouTubeVideoId(`https://youtu.be/${VALID_ID}`)).toBe(
      VALID_ID,
    );
  });

  it("extracts ID from embed URLs", () => {
    expect(
      extractYouTubeVideoId(`https://www.youtube.com/embed/${VALID_ID}`),
    ).toBe(VALID_ID);
    expect(
      extractYouTubeVideoId(
        `https://www.youtube-nocookie.com/embed/${VALID_ID}`,
      ),
    ).toBe(VALID_ID);
  });

  it("extracts ID from shorts URLs", () => {
    expect(
      extractYouTubeVideoId(`https://www.youtube.com/shorts/${VALID_ID}`),
    ).toBe(VALID_ID);
  });

  it("extracts bare 11-char video ID", () => {
    expect(extractYouTubeVideoId(VALID_ID)).toBe(VALID_ID);
    expect(extractYouTubeVideoId("abc_DEF-123")).toBe("abc_DEF-123");
  });

  it("handles whitespace around input", () => {
    expect(extractYouTubeVideoId(`  ${VALID_ID}  `)).toBe(VALID_ID);
    expect(extractYouTubeVideoId(`  https://youtu.be/${VALID_ID}  `)).toBe(
      VALID_ID,
    );
  });

  it("returns null for empty/blank input", () => {
    expect(extractYouTubeVideoId("")).toBeNull();
    expect(extractYouTubeVideoId("   ")).toBeNull();
  });

  it("returns null for non-YouTube URLs", () => {
    expect(extractYouTubeVideoId("https://vimeo.com/12345")).toBeNull();
    expect(extractYouTubeVideoId("https://google.com")).toBeNull();
  });

  it("returns null for YouTube URLs without valid ID", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/")).toBeNull();
    expect(extractYouTubeVideoId("https://www.youtube.com/watch")).toBeNull();
    expect(
      extractYouTubeVideoId("https://www.youtube.com/watch?v=short"),
    ).toBeNull();
  });

  it("returns null for IDs with wrong length", () => {
    expect(extractYouTubeVideoId("abcdef")).toBeNull(); // too short
    expect(extractYouTubeVideoId("abcdefghijkl")).toBeNull(); // too long (12 chars)
  });

  it("extracts ID from URLs with extra query params", () => {
    expect(
      extractYouTubeVideoId(`https://www.youtube.com/watch?v=${VALID_ID}&t=42`),
    ).toBe(VALID_ID);
    expect(
      extractYouTubeVideoId(
        `https://www.youtube.com/watch?v=${VALID_ID}&list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf`,
      ),
    ).toBe(VALID_ID);
  });
});
