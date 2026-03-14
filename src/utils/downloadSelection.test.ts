import { describe, it, expect } from "vitest";

import { validateDownloadSelectionCount } from "~/utils/downloadSelection";

describe("validateDownloadSelectionCount", () => {
  it("returns an error when nothing is selected", () => {
    expect(validateDownloadSelectionCount(0, "tracks")).toBe(
      "No tracks selected for download",
    );
  });

  it("returns an error when more than 50 are selected", () => {
    expect(validateDownloadSelectionCount(51, "videos")).toBe(
      "Cannot download more than 50 videos at once",
    );
  });

  it("returns null for valid selection sizes", () => {
    expect(validateDownloadSelectionCount(1, "tracks")).toBeNull();
    expect(validateDownloadSelectionCount(50, "tracks")).toBeNull();
  });
});
