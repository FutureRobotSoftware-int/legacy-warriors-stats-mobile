const GCS_BASE_URL = "";

export function getGCSVideoUrl(
  shotId: string | number,
  playerSlug: string,
  period: string
): string {
  return `${GCS_BASE_URL}/players/${playerSlug}/${period}/videos/${shotId}.mp4`;
}

export async function fetchGCSVideoUrl(
  shotId: string | number,
  playerSlug: string,
  period: string
): Promise<string | null> {
  const url = getGCSVideoUrl(shotId, playerSlug, period);

  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok ? url : null;
  } catch {
    return null;
  }
}
