import { ref } from 'vue'
import { fetchGCSVideoUrl, getGCSVideoUrl } from '../utils/getGCS'

/**
 * Composable for managing video loading with lazy loading and preloading
 */
export function useVideoLoader() {
    const loadedVideos = ref<Set<string>>(new Set())
    const videoItems = ref<{ id: string; videoUrl: string | null }[]>([])
    const currentLoadingIndex = ref(3) // Start loading from index 3 (4th video)
    const isSequentialLoading = ref(false)

    /**
     * Load a batch of videos from GCS
     * @param ids - Array of video IDs to load
     * @param folderPath - Path to the videos in the bucket
     */
    async function loadBatch(ids: string[], folderPath?: string) {
        const batchResults = await Promise.all(
            ids.map(async (id) => {
                if (loadedVideos.value.has(id)) return null

                try {
                    // Use fetchGCSVideoUrl to verify existence (optional)
                    const videoUrl = await fetchGCSVideoUrl(id, folderPath)
                    loadedVideos.value.add(id)
                    return {
                        id,
                        videoUrl: videoUrl || getGCSVideoUrl(id), // Fallback to direct URL
                    }
                } catch (error) {
                    console.error(`Error loading video ${id}:`, error)
                    return {
                        id,
                        videoUrl: null,
                    }
                }
            })
        )

        // Update only the videos loaded in this batch
        batchResults.forEach((result) => {
            if (!result) return
            const index = videoItems.value.findIndex((item) => item.id === result.id)
            if (index !== -1) {
                videoItems.value[index] = result
            }
        })
    }

    /**
     * Load videos sequentially one by one
     * @param folderPath - Path to the videos in the bucket
     */
    async function loadSequentially(folderPath?: string) {
        if (isSequentialLoading.value || currentLoadingIndex.value >= videoItems.value.length) {
            return
        }

        isSequentialLoading.value = true
        const id = videoItems.value[currentLoadingIndex.value].id
        
        try {
            if (!loadedVideos.value.has(id)) {
                const videoUrl = await fetchGCSVideoUrl(id, folderPath)
                loadedVideos.value.add(id)
                videoItems.value[currentLoadingIndex.value] = {
                    id,
                    videoUrl: videoUrl || getGCSVideoUrl(id),
                }
            }
        } catch (error) {
            console.error(`Error loading video ${id}:`, error)
            videoItems.value[currentLoadingIndex.value] = {
                id,
                videoUrl: null,
            }
        }

        currentLoadingIndex.value++
        isSequentialLoading.value = false
        
        // Load next video after a short delay
        setTimeout(() => loadSequentially(folderPath), 100)
    }

    /**
     * Preload videos adjacent to the selected slide
     * @param centerIndex - Index of the currently centered slide
     * @param folderPath - Path to the videos in the bucket
     */
    function preloadAdjacentVideos(centerIndex: number, folderPath?: string) {
        if (!folderPath) return

        const preloadThreshold = 2 // Number of adjacent videos to preload
        const start = Math.max(0, centerIndex - preloadThreshold)
        const end = Math.min(videoItems.value.length - 1, centerIndex + preloadThreshold)

        const idsToLoad = []
        for (let i = start; i <= end; i++) {
            const item = videoItems.value[i]
            if (item && !loadedVideos.value.has(item.id)) {
                idsToLoad.push(item.id)
            }
        }

        if (idsToLoad.length > 0) {
            loadBatch(idsToLoad, folderPath)
        }
    }

    return {
        loadedVideos,
        videoItems,
        loadBatch,
        loadSequentially,
        preloadAdjacentVideos,
    }
}