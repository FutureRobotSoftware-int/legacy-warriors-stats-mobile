<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCarousel } from '../../../services/utils/useCarousel'
import { useVideoLoader } from '../../../services/footage/useVideoLoader'
import { useVideoPlayers } from '../../../services/footage/useVideoPlayers'
import VideoPlayer from '../videoPlayer/VideoPlayer.vue'
import SingleTable from '../../tabs/SingleTable.vue'
import { usePeriod } from '../../../services/stores/year'

const {
  mode,
  isLoading,
  prevBtn,
  nextBtn,
  emblaRef,
  emblaApi,
  playerStore,
  shotData,
  getIdsByMode,
  handleSlideSelect
} = useCarousel()

const { videoItems, loadBatch, loadSequentially } = useVideoLoader()
const { playPlayer, pauseAllPlayers } = useVideoPlayers()

const periodStore = usePeriod()

const selectedPeriod = computed(() => periodStore.selectedPeriod?.period)
const effectivePeriod = computed(() =>
  selectedPeriod.value === 'All time' ? null : selectedPeriod.value
)

const lastContext = ref<{ player: string; period: string | null }>({
  player: '',
  period: null
})


async function loadDriveVideos() {
  if (isLoading.value) return

  const playerSlug = playerStore.selectedPlayer?.data?.toLowerCase()
  if (!playerSlug) return

  const ids = getIdsByMode()
  const period = effectivePeriod.value ?? null

  if (
    lastContext.value.player === playerSlug &&
    lastContext.value.period === period &&
    JSON.stringify(videoItems.value.map(v => v.id)) === JSON.stringify(ids)
  ) {
    return
  }
  
  isLoading.value = true
  lastContext.value = { player: playerSlug, period }

  videoItems.value = ids.map(id => ({
    id,
    videoUrl: null // loading
  }))

  const firstBatch = ids.slice(0, 3)
  await loadBatch(firstBatch, playerSlug, period)
  loadSequentially(playerSlug, period)

  isLoading.value = false
}

function handleNavigation(direction: 'prev' | 'next') {
  pauseAllPlayers()
  direction === 'prev'
    ? emblaApi.value?.scrollPrev()
    : emblaApi.value?.scrollNext()

  const index = handleSlideSelect()
  if (index !== undefined) {
    setTimeout(() => playPlayer(index), 100)
  }
}

const dynamicEntries = computed(() =>
  videoItems.value.map(item => {
    const shotInfo = shotData.getById(Number(item.id)) ?? null

    return {
      ...item,
      metadata: shotInfo
    }
  })
)


watch(
  () => [
    ...shotData.getActiveIds,
    mode.value,
    selectedPeriod.value,
    playerStore.selectedPlayer?.data
  ],
  loadDriveVideos,
  { immediate: true }
)
</script>

<template>
  <div class="space-y-4 relative">
    <!-- Carousel container -->
    <div class="relative">
      <!-- Previous slide button -->
      <button
        ref="prevBtn"
        class="embla__button embla__button--prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-all"
        :disabled="!emblaApi?.canScrollPrev()"
        @click="handleNavigation('prev')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <!-- Carousel viewport -->
      <div class="overflow-hidden" ref="emblaRef">
        <div class="flex">
          <!-- Slide items -->
          <div
            v-for="(item, index) in dynamicEntries"
            :key="item.id"
            class="min-w-full px-2 space-y-4"
          >

            <SingleTable :metadata="item.metadata" />

            <div
              v-if="isLoading && !item.videoUrl"
              class="bg-gray-100 w-full aspect-video flex items-center justify-center"
            >
              <span class="loading loading-spinner text-primary"></span>
            </div>

            <VideoPlayer
              v-else-if="item.videoUrl"
              :src="item.videoUrl"
              :autoplay="index === 0"
            />

            <div
              v-else
              class="bg-base-200 border border-base-300 p-4 text-center rounded-md text-sm text-gray-600"
            >
              <strong>No footage found</strong> for ID <code>{{ item.id }}</code>.
            </div>

          </div>

        </div>
      </div>

      <!-- Next slide button -->
      <button
        ref="nextBtn"
        class="embla__button embla__button--next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-all"
        :disabled="!emblaApi?.canScrollNext()"
        @click="handleNavigation('next')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Carousel button base styles */
.embla__button {
  outline: 0;
  cursor: pointer;
  touch-action: manipulation;
}

/* Disabled button styles */
.embla__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Ensure carousel has space for navigation buttons */
.embla__container {
  padding: 0 40px;
}
</style>