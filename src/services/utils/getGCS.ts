const CACHE_KEY = 'gcsVideoCache';

interface CacheEntry {
    url: string | null;
    timestamp: number;
}

// Load cache from localStorage
function loadCache(): Map<string, CacheEntry> {
    const cachedData = localStorage.getItem(CACHE_KEY);
    return cachedData ? new Map(JSON.parse(cachedData)) : new Map();
}

// Save cache to localStorage
function saveCache(cache: Map<string, CacheEntry>) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(cache.entries())));
}

const cache = loadCache();

// CDN URL configuration
const GCS_BASE_URL = "http://35.241.58.205/";
// const GCS_BASE_URL = "https://34.54.50.170/"

// Generate GCS video URL
export function getGCSVideoUrl(videoName: string): string {
    return `${GCS_BASE_URL}${videoName}.mp4`;
}

/**
 * Fetch GCS video URL with caching mechanism
 * @param videoName - Name of the video file (without extension)
 * @param folderPath - Path to the video in the bucket
 * @returns Promise with video URL or null if not found
 */
export async function fetchGCSVideoUrl(
    videoName: string,
    folderPath: string = ""
): Promise<string | null> {
    const cacheKey = `${folderPath}/${videoName}`;
    const now = Date.now();
    const TTL = 24 * 60 * 60 * 1000; // 24 hours

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp < TTL)) {
        return cached.url;
    }

    const videoUrl = getGCSVideoUrl(`${folderPath}/${videoName}`);

    // Optional: Verify if video exists (requires CORS)
    try {
        const response = await fetch(videoUrl, { method: 'HEAD' });
        if (response.ok) {
            cache.set(cacheKey, { url: videoUrl, timestamp: now });
            saveCache(cache);
            return videoUrl;
        }
        console.log(response);

        return null;
    } catch {
        return null;
    }
}