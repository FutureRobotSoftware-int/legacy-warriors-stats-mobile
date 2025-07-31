import { ref } from 'vue'
import { fetchDriveIdByVideoName, getGoogleDriveVideoUrl } from '../utils/getDriveURL'
export function useVideoLoader() {
    const loadedVideos = ref<Set<string>>(new Set())
    const videoItems = ref<{ id: string, videoUrl: string | null }[]>([])

    // Load a batch of videos
    async function loadBatch(ids: string[], folderId: string) {
        const batchResults = await Promise.all(
            ids.map(async (id) => {
                if (loadedVideos.value.has(id)) return null

                try {
                    const driveId = await fetchDriveIdByVideoName(id, folderId)
                    loadedVideos.value.add(id)
                    return {
                        id,
                        videoUrl: driveId ? getGoogleDriveVideoUrl(driveId) : null,
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

        // Update only the loaded videos in the batch
        batchResults.forEach((result) => {
            if (!result) return
            const index = videoItems.value.findIndex(item => item.id === result.id)
            if (index !== -1) {
                videoItems.value[index] = result
            }
        })
    }

    // Preload adjacent videos when a slide is selected
    function preloadAdjacentVideos(centerIndex: number, folderId: string | undefined) {
        if (!folderId) return

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
            loadBatch(idsToLoad, folderId)
        }
    }

    return {
        loadedVideos,
        videoItems,
        loadBatch,
        preloadAdjacentVideos
    }
}