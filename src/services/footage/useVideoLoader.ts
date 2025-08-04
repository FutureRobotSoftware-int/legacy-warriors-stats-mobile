import { ref } from 'vue'
import { fetchGCSVideoUrl, getGCSVideoUrl } from '../utils/getGCS'

export function useVideoLoader() {
    const loadedVideos = ref<Set<string>>(new Set())
    const videoItems = ref<{ id: string; videoUrl: string | null }[]>([])

    // Carga un lote de videos desde GCS
    async function loadBatch(ids: string[], folderPath?: string) {
        const batchResults = await Promise.all(
            ids.map(async (id) => {
                if (loadedVideos.value.has(id)) return null

                try {
                    // Usar fetchGCSVideoUrl para verificar existencia (opcional)
                    const videoUrl = await fetchGCSVideoUrl(id, folderPath)
                    loadedVideos.value.add(id)
                    return {
                        id,
                        videoUrl: videoUrl || getGCSVideoUrl(id), // Fallback a URL directa
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

        // Actualizar solo los videos cargados en el lote
        batchResults.forEach((result) => {
            if (!result) return
            const index = videoItems.value.findIndex((item) => item.id === result.id)
            if (index !== -1) {
                videoItems.value[index] = result
            }
        })
    }

    // Precarga videos adyacentes al slide seleccionado
    function preloadAdjacentVideos(centerIndex: number, folderPath?: string) {
        if (!folderPath) return

        const preloadThreshold = 2 // Número de videos adyacentes a precargar
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
        preloadAdjacentVideos,
    }
}