/**
 * Triggers a browser file download by creating a temporary anchor element.
 * Falls back to window.open if the anchor approach fails.
 */
export function triggerBrowserDownload(url: string, filename?: string): void {
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename ?? "";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    window.open(url, "_blank");
  }
}
