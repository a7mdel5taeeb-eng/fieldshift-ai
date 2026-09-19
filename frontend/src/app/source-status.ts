export const sourceStatuses = ["LIVE_DATA", "CACHED_DATA", "DEMO_SNAPSHOT", "UNAVAILABLE"] as const;

export type SourceStatus = (typeof sourceStatuses)[number];

export function normalizeSourceStatus(value: unknown): SourceStatus {
  return typeof value === "string" && sourceStatuses.includes(value as SourceStatus)
    ? value as SourceStatus
    : "UNAVAILABLE";
}
