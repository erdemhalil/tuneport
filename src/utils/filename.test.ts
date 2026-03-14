import { describe, it, expect } from "vitest";
import { extractFeaturedArtists, sanitizeTrackFilename } from "./filename";

describe("extractFeaturedArtists", () => {
  it("extracts feat. artists from title", () => {
    const [artists, title] = extractFeaturedArtists(
      ["Artist1"],
      "Song feat. Artist2",
    );
    expect(artists).toEqual(["Artist1", "Artist2"]);
    expect(title).toBe("Song");
  });

  it("extracts ft. artists from title", () => {
    const [artists, title] = extractFeaturedArtists(
      ["Artist1"],
      "Song ft. Artist2",
    );
    expect(artists).toEqual(["Artist1", "Artist2"]);
    expect(title).toBe("Song");
  });

  it("extracts parenthesized feat. artists", () => {
    const [artists, title] = extractFeaturedArtists(
      ["Artist1"],
      "Song (feat. Artist2)",
    );
    expect(artists).toEqual(["Artist1", "Artist2"]);
    expect(title).toBe("Song");
  });

  it("extracts multiple featured artists separated by comma and ampersand", () => {
    const [artists, title] = extractFeaturedArtists(
      ["Artist1"],
      "Song feat. Artist2, Artist3 & Artist4",
    );
    expect(artists).toEqual(["Artist1", "Artist2", "Artist3", "Artist4"]);
    expect(title).toBe("Song");
  });

  it("returns original title and artists when no featured artists", () => {
    const [artists, title] = extractFeaturedArtists(["Artist1"], "Normal Song");
    expect(artists).toEqual(["Artist1"]);
    expect(title).toBe("Normal Song");
  });

  it("prevents duplicate artists (case-insensitive)", () => {
    const [artists, title] = extractFeaturedArtists(
      ["Artist1", "Artist2"],
      "Song feat. Artist2",
    );
    expect(artists).toEqual(["Artist1", "Artist2"]);
    expect(title).toBe("Song");
  });

  it("handles case-insensitive feat matching", () => {
    const [artists, title] = extractFeaturedArtists(
      ["artist1"],
      "Song FEAT. Artist2",
    );
    expect(artists).toEqual(["artist1", "Artist2"]);
    expect(title).toBe("Song");
  });

  it("does not mutate the input array", () => {
    const inputArtists = ["Artist1"];
    const [returnedArtists] = extractFeaturedArtists(
      inputArtists,
      "Song feat. Artist2",
    );
    // The returned array is a new copy, not the same reference
    expect(returnedArtists).not.toBe(inputArtists);
    expect(inputArtists).toEqual(["Artist1"]); // Input unchanged
    expect(returnedArtists).toEqual(["Artist1", "Artist2"]); // New array has merged artists
  });

  it("handles parenthesized ft. variant", () => {
    const [artists, title] = extractFeaturedArtists(
      ["Artist1"],
      "Song (ft. Artist2)",
    );
    expect(artists).toEqual(["Artist1", "Artist2"]);
    expect(title).toBe("Song");
  });

  it("only processes the first feat string found", () => {
    const [artists, title] = extractFeaturedArtists(
      ["Artist1"],
      "Song feat. Artist2 ft. Artist3",
    );
    // "feat." is matched first; "ft. Artist3" stays as part of the featured artist name
    expect(title).toBe("Song");
    expect(artists).toContain("Artist1");
    expect(artists).toContain("Artist2 ft. Artist3");
  });

  it("trims whitespace from extracted title", () => {
    const [, title] = extractFeaturedArtists(
      ["Artist1"],
      "  Song   feat. Artist2",
    );
    expect(title).toBe("Song");
  });

  it("handles empty featured artist name gracefully", () => {
    const [artists, title] = extractFeaturedArtists(["Artist1"], "Song feat. ");
    // Empty string after filtering — no artists extracted, title stays original
    expect(title).toBe("Song feat. ");
    expect(artists).toEqual(["Artist1"]);
  });
});

describe("sanitizeTrackFilename", () => {
  it("removes filesystem-illegal characters", () => {
    expect(sanitizeTrackFilename('Song: The "Best"')).toBe("Song The Best");
  });

  it("replaces & with 'and'", () => {
    expect(sanitizeTrackFilename("Song & Dance")).toBe("Song and Dance");
  });

  it("strips YouTube metadata in brackets/parens", () => {
    expect(sanitizeTrackFilename("Song (Official Video)")).toBe("Song");
  });

  it("strips lyrics suffix with dash", () => {
    expect(sanitizeTrackFilename("Song - Lyrics")).toBe("Song");
  });

  it("handles multiple metadata suffixes", () => {
    expect(sanitizeTrackFilename("Song (Official Music Video) [HD]")).toBe(
      "Song",
    );
  });

  it("preserves normal text", () => {
    expect(sanitizeTrackFilename("Normal Song Title")).toBe(
      "Normal Song Title",
    );
  });

  it("replaces single quotes (regex character class)", () => {
    // The source regex ['''] contains ASCII single quotes — this is effectively a no-op
    // but confirms the replace doesn't break normal apostrophes
    expect(sanitizeTrackFilename("Song's")).toBe("Song's");
  });

  it("trims whitespace", () => {
    expect(sanitizeTrackFilename("  Song  ")).toBe("Song");
  });

  it("removes trailing dots", () => {
    expect(sanitizeTrackFilename("Song...")).toBe("Song");
  });

  it("collapses multiple spaces into one", () => {
    expect(sanitizeTrackFilename("Song   Title")).toBe("Song Title");
  });

  it("removes all illegal chars: backslash, slash, colon, asterisk, question, angle brackets, pipe", () => {
    expect(sanitizeTrackFilename("a\\b/c:d*e?f<g>h|i")).toBe("abcdefghi");
  });

  it("strips audio metadata suffix", () => {
    expect(sanitizeTrackFilename("Song (Audio)")).toBe("Song");
    expect(sanitizeTrackFilename("Song [Official Audio]")).toBe("Song");
  });

  it("strips visualizer metadata", () => {
    expect(sanitizeTrackFilename("Song (Visualizer)")).toBe("Song");
  });

  it("strips dash-separated official video suffix", () => {
    expect(sanitizeTrackFilename("Song - Official Video")).toBe("Song");
    expect(sanitizeTrackFilename("Song \u2013 Official Video")).toBe("Song");
  });

  it("handles 4K/8K metadata", () => {
    expect(sanitizeTrackFilename("Song [4K]")).toBe("Song");
    expect(sanitizeTrackFilename("Song (8K)")).toBe("Song");
  });

  it("is case-insensitive when stripping metadata", () => {
    expect(sanitizeTrackFilename("Song (OFFICIAL VIDEO)")).toBe("Song");
    expect(sanitizeTrackFilename("Song (official video)")).toBe("Song");
    expect(sanitizeTrackFilename("Song - LYRICS")).toBe("Song");
  });

  it("handles empty string", () => {
    expect(sanitizeTrackFilename("")).toBe("");
  });
});
