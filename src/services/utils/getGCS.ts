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

// URL base de tu CDN o bucket público
const GCS_BASE_URL = "http://35.241.58.205/"; // Reemplaza con tu URL de CDN

export function getGCSVideoUrl(videoName: string): string {
    return `${GCS_BASE_URL}${videoName}.mp4`;
}

export async function fetchGCSVideoUrl(
    videoName: string,
    folderPath: string = "" // Opcional: si tienes subcarpetas en el bucket
): Promise<string | null> {
    const cacheKey = `${folderPath}/${videoName}`;
    const now = Date.now();
    const TTL = 24 * 60 * 60 * 1000; // 24 horas

    // Verificar caché
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp < TTL)) {
        return cached.url;
    }

    // En GCS no necesitamos una API para verificar existencia (asumimos URLs públicas)
    const videoUrl = getGCSVideoUrl(`${folderPath}/${videoName}`);

    // Opcional: Verificar si el video existe (requiere CORS configurado en el bucket)
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