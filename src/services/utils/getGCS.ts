const GCS_BASE_URL = ""

export function buildVideoPath(
  shotId: string | number,
  playerSlug: string,
  period?: string | null
): string {
  if (!period || period === 'All time') {
    return `${GCS_BASE_URL}/players/${playerSlug}/videos/${shotId}.mp4`
  }

  return `${GCS_BASE_URL}/players/${playerSlug}/${period}/videos/${shotId}.mp4`
}

export async function fetchGCSVideoUrl(
  shotId: string | number,
  playerSlug: string,
  period?: string | null
): Promise<string | null> {
  const url = buildVideoPath(shotId, playerSlug, period)

  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok ? url : null
  } catch {
    return null
  }
}
