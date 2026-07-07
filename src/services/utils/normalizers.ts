export function normalizeShotEntry(
  entry: any,
  VideoID: number,
  id: number
) {
  const normalized = { ...entry }

  if (normalized["Pass Direction"] === "N/A Off Dribble") {
    normalized["Pass Direction"] = "Off the Dribble"
  }

  if (normalized["Off Dribble Hand"] === "N/A") {
    normalized["Off Dribble Hand"] = "Catch & Shoot"
  }

  return {
    id,
    VideoID,
    ...normalized,
  }
}

export type ShotResult = "Make" | "Miss";

export function getShotResult(value?: unknown): ShotResult | null {
  if (typeof value !== "string") return null;

  if (/\bmake\b/i.test(value)) return "Make";
  if (/\bmiss\b/i.test(value)) return "Miss";

  return null;
}