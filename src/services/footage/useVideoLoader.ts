import { ref } from "vue"
import { fetchGCSVideoUrl } from "../utils/getGCS"

export function useVideoLoader() {
  const loadedVideos = ref<Set<string>>(new Set())
  const videoItems = ref<{ id: string; videoUrl: string | null }[]>([])
  const currentLoadingIndex = ref(3)
  const isSequentialLoading = ref(false)

  const makeKey = (id: string, player: string, period: string) =>
    `${player}|${period}|${id}`

  async function loadBatch(
    ids: string[],
    playerSlug: string,
    period: string
  ) {
    if (period === "All time") return

    const results = await Promise.all(
      ids.map(async (id) => {
        const key = makeKey(id, playerSlug, period)
        if (loadedVideos.value.has(key)) return null

        const url = await fetchGCSVideoUrl(id, playerSlug, period)
        loadedVideos.value.add(key)

        return { id, videoUrl: url }
      })
    )

    results.forEach((res) => {
      if (!res) return
      const index = videoItems.value.findIndex(v => v.id === res.id)
      if (index !== -1) videoItems.value[index] = res
    })
  }

  async function loadSequentially(playerSlug: string, period: string) {
    if (
      period === "All time" ||
      isSequentialLoading.value ||
      currentLoadingIndex.value >= videoItems.value.length
    ) return

    isSequentialLoading.value = true
    const id = videoItems.value[currentLoadingIndex.value].id
    const key = makeKey(id, playerSlug, period)

    if (!loadedVideos.value.has(key)) {
      const url = await fetchGCSVideoUrl(id, playerSlug, period)
      loadedVideos.value.add(key)
      videoItems.value[currentLoadingIndex.value] = { id, videoUrl: url }
    }

    currentLoadingIndex.value++
    isSequentialLoading.value = false
    setTimeout(() => loadSequentially(playerSlug, period), 100)
  }

  function preloadAdjacentVideos(
    centerIndex: number,
    playerSlug: string,
    period: string
  ) {
    if (period === "All time") return

    const ids: string[] = []
    for (let i = Math.max(0, centerIndex - 2); i <= centerIndex + 2; i++) {
      const item = videoItems.value[i]
      if (item) ids.push(item.id)
    }

    loadBatch(ids, playerSlug, period)
  }

  return {
    videoItems,
    loadedVideos,
    loadBatch,
    loadSequentially,
    preloadAdjacentVideos,
  }
}
