<script setup lang="ts">
import { computed, watch } from 'vue'
import { useCarousel } from '../../../services/utils/useCarousel'
import { useVideoPlayers } from '../../../services/footage/useVideoPlayers'
import { usePeriod } from '../../../services/stores/year'
import CarouselVideoItem from './CarouselVideoItem.vue'

const {
  prevBtn,
  nextBtn,
  emblaRef,
  emblaApi,
  playerStore,
  shotData,
  getIdsByMode,
  handleSlideSelect
} = useCarousel()

const { playPlayer, pauseAllPlayers } = useVideoPlayers()
const periodStore = usePeriod()

/* ============================
   Computed state
============================ */

const selectedPeriod = computed(() => periodStore.selectedPeriod?.period)
const effectivePeriod = computed(() =>
  selectedPeriod.value === 'All time' ? null : (selectedPeriod.value ?? null)
)

const playerSlug = computed(
  () => playerStore.selectedPlayer?.data?.toLowerCase() ?? ''
)

const entries = computed(() =>
  getIdsByMode()
    .map(id => shotData.getById(Number(id)))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
)

/* ============================
   Navigation
============================ */

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

/* ============================
   Auto play first slide
============================ */

watch(
  entries,
  () => {
    setTimeout(() => playPlayer(0), 150)
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-4 relative">
    <div class="relative">
      <!-- Prev button -->
      <button
        ref="prevBtn"
        class="embla__button embla__button--prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-all"
        :disabled="!emblaApi?.canScrollPrev()"
        @click="handleNavigation('prev')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <!-- Carousel viewport -->
      <div ref="emblaRef" class="overflow-hidden">
        <div class="flex">
          <div
            v-for="(entry, index) in entries"
            :key="entry.id"
            class="min-w-full px-2 space-y-4"
          >
            <CarouselVideoItem
              :entry="entry"
              :player-slug="playerSlug"
              :period="effectivePeriod"
              :autoplay="index === 0"
            />
          </div>
        </div>
      </div>

      <!-- Next button -->
      <button
        ref="nextBtn"
        class="embla__button embla__button--next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-all"
        :disabled="!emblaApi?.canScrollNext()"
        @click="handleNavigation('next')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.embla__button {
  outline: 0;
  cursor: pointer;
  touch-action: manipulation;
}

.embla__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
