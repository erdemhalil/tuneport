import { describe, it, expect } from "vitest";
import { parseIsoDuration, formatDuration, formatDurationMs } from "./duration";

describe("parseIsoDuration", () => {
  it("parses hours, minutes, and seconds", () => {
    expect(parseIsoDuration("PT1H2M3S")).toBe(3723);
  });

  it("parses minutes and seconds only", () => {
    expect(parseIsoDuration("PT3M45S")).toBe(225);
  });

  it("parses seconds only", () => {
    expect(parseIsoDuration("PT30S")).toBe(30);
  });

  it("parses minutes only", () => {
    expect(parseIsoDuration("PT5M")).toBe(300);
  });

  it("parses hours only", () => {
    expect(parseIsoDuration("PT2H")).toBe(7200);
  });

  it("returns 0 for invalid/empty input", () => {
    expect(parseIsoDuration("")).toBe(0);
    expect(parseIsoDuration("invalid")).toBe(0);
    expect(parseIsoDuration("P1D")).toBe(0); // days not supported
  });

  it("handles zero duration", () => {
    expect(parseIsoDuration("PT0S")).toBe(0);
    expect(parseIsoDuration("PT0M0S")).toBe(0);
  });
});

describe("formatDuration", () => {
  it("formats minutes and seconds as M:SS", () => {
    expect(formatDuration("PT3M45S")).toBe("3:45");
    expect(formatDuration("PT0M5S")).toBe("0:05");
  });

  it("formats hours as H:MM:SS", () => {
    expect(formatDuration("PT1H2M3S")).toBe("1:02:03");
    expect(formatDuration("PT2H0M0S")).toBe("2:00:00");
  });

  it("pads seconds to 2 digits", () => {
    expect(formatDuration("PT4M5S")).toBe("4:05");
  });

  it("returns 0:00 for invalid input", () => {
    expect(formatDuration("")).toBe("0:00");
    expect(formatDuration("invalid")).toBe("0:00");
  });

  it("handles seconds-only durations", () => {
    expect(formatDuration("PT45S")).toBe("0:45");
  });
});

describe("formatDurationMs", () => {
  it("formats standard durations", () => {
    expect(formatDurationMs(225000)).toBe("3:45"); // 3m 45s
    expect(formatDurationMs(60000)).toBe("1:00"); // exactly 1m
  });

  it("pads seconds to 2 digits", () => {
    expect(formatDurationMs(5000)).toBe("0:05");
    expect(formatDurationMs(65000)).toBe("1:05");
  });

  it("handles zero", () => {
    expect(formatDurationMs(0)).toBe("0:00");
  });

  it("handles long durations", () => {
    expect(formatDurationMs(3600000)).toBe("60:00"); // 1 hour
    expect(formatDurationMs(7200000)).toBe("120:00"); // 2 hours
  });

  it("truncates sub-second precision", () => {
    expect(formatDurationMs(5500)).toBe("0:05"); // 5.5s → 5s
    expect(formatDurationMs(59999)).toBe("0:59");
  });
});
