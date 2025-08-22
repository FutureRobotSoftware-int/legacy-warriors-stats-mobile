<script setup lang="ts">
import { computed, watch } from 'vue'
import { useCarousel } from '../../../services/utils/useCarousel'
import { useVideoLoader } from '../../../services/footage/useVideoLoader'
import { useVideoPlayers } from '../../../services/footage/useVideoPlayers'
import 'video.js/dist/video-js.css'
import VideoPlayer from '../videoPlayer/VideoPlayer.vue'
import SingleTable from '../../tabs/SingleTable.vue'

// Composable setup
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

const {
  loadedVideos,
  videoItems,
  loadBatch,
  loadSequentially
} = useVideoLoader()

const {
  videoPlayers,
  playPlayer,
  pauseAllPlayers
} = useVideoPlayers()

// Load videos with lazy loading
async function loadDriveVideos() {
  if (isLoading.value) return;

  isLoading.value = true
  const idsToShow = getIdsByMode()
  const selectedFolder = playerStore.selectedPlayer?.data.toLowerCase()

  if (!selectedFolder) {
    videoItems.value = []
    isLoading.value = false
    return
  }

  if (JSON.stringify(videoItems.value.map(i => i.id)) === JSON.stringify(idsToShow)) {
    isLoading.value = false
    return
  }

  // Initialize all items with null URLs
  videoItems.value = idsToShow.map(id => ({ id, videoUrl: null }))

  // Load only the first 3 videos initially
  const initialBatch = idsToShow.slice(0, 3)
  await loadBatch(initialBatch, selectedFolder)

  // Start sequential loading for the rest
  loadSequentially(selectedFolder)

  isLoading.value = false
}

// Handle navigation
const handleNavigation = (direction: 'prev' | 'next') => {
  pauseAllPlayers()
  if (direction === 'prev') {
    emblaApi.value?.scrollPrev()
  } else {
    emblaApi.value?.scrollNext()
  }
  const selectedIndex = handleSlideSelect()
  if (selectedIndex !== undefined) {
    // Small timeout to ensure the slide transition is complete
    setTimeout(() => {
      playPlayer(selectedIndex)
    }, 100)
  }
}

// Watch for changes to active IDs or mode
watch(() => [...shotData.getActiveIds], loadDriveVideos, { immediate: true })
watch(mode, loadDriveVideos, { deep: false })

console.log(videoItems);

const dynamicEntries = computed(() => {
  const items = videoItems.value;
  return items.map(videoItem => {
    const shotInfo = shotData.getById(parseInt(videoItem.id));
    return {
      ...videoItem,       
      metadata: {
        ...shotInfo
      },         
    };
  });
});

console.log(dynamicEntries)

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
            class="min-w-full px-2 space-y-2"
          >
            <!-- Loading state -->
            <div v-if="!item.videoUrl && !loadedVideos.has(item.id.toString())" class="bg-gray-100 w-full aspect-video flex items-center justify-center">
              <span class="loading loading-spinner text-primary"></span>
            </div>
            
            <!-- Video player -->
            <div v-else-if="item.videoUrl" class="flex flex-col justify-center">
              <!-- Modified container for SingleTable -->
              <div class="flex justify-center w-full mb-4">
                <SingleTable :metadata="item.metadata" />
              </div>
              
              <VideoPlayer 
                :src="item.videoUrl" 
                :autoplay="index === 0"
                ref="videoPlayers"
              />
            </div>
            
            <!-- Missing footage message -->
            <div v-else class="bg-base-200 border border-base-300 p-4 text-center rounded-md text-sm text-gray-600">
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