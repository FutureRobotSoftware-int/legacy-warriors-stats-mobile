const CACHE_KEY = 'gcsVideoCache';

interface CacheEntry {
    url: string | null;
    timestamp: number;
}

// Cargar caché (igual que antes)
function loadCache(): Map<string, CacheEntry> {
    const cachedData = localStorage.getItem(CACHE_KEY);
    return cachedData ? new Map(JSON.parse(cachedData)) : new Map();
}

function saveCache(cache: Map<string, CacheEntry>) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(cache.entries())));
}

const cache = loadCache();

// URL CDN
// const GCS_BASE_URL = "http://35.241.58.205/";
const ALT_CGS_BASE_URL = "https://34.54.50.170/"

export function getGCSVideoUrl(videoName: string): string {
    return `${ALT_CGS_BASE_URL}${videoName}.mp4`;
}

export async function fetchGCSVideoUrl(
    videoName: string,
    folderPath: string = ""
): Promise<string | null> {
    const cacheKey = `${folderPath}/${videoName}`;
    const now = Date.now();
    const TTL = 24 * 60 * 60 * 1000; // 24 horas

    // Verificar caché
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp < TTL)) {
        return cached.url;
    }

    const videoUrl = getGCSVideoUrl(`${folderPath}/${videoName}`);

    // Opcional: Verificar si el video existe (requiere CORS)
    try {
        const response = await fetch(videoUrl, { method: 'HEAD' });
        if (response.ok) {
            cache.set(cacheKey, { url: videoUrl, timestamp: now });
            saveCache(cache);
            return videoUrl;
        }
        return null;
    } catch {
        return null;
    }
}