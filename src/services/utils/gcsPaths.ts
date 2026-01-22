const GCS_BASE_URL = ""

export function buildPlayerFolder(playerSlug: string) {
    return `${GCS_BASE_URL}/players/${playerSlug}`
}

export function buildShotDataPath(
    playerSlug: string,
    period?: string | null
) {
    return `${buildPlayerFolder(playerSlug)}/${period}/shotdata.csv`
}

export function buildFootageFolder(
    playerSlug: string,
    period?: string | null
) {
    if (!period || period === "All time") {
        return `${buildPlayerFolder(playerSlug)}/videos`
    }

    return `${buildPlayerFolder(playerSlug)}/${period}/videos`
}

export function buildVideoPath(
    shotId: string | number,
    playerSlug: string,
    period?: string | null
) {
    return `${buildFootageFolder(playerSlug, period)}/${shotId}.mp4`
}
