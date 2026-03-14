export function validateDownloadSelectionCount(
  count: number,
  itemLabel: string,
): string | null {
  if (count === 0) {
    return `No ${itemLabel} selected for download`;
  }

  if (count > 50) {
    return `Cannot download more than 50 ${itemLabel} at once`;
  }

  return null;
}
