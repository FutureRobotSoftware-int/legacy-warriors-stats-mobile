<script setup>
import emblaCarouselVue from 'embla-carousel-vue'
import SmallCard from './SmallCard.vue';
import { useShotData } from '../../services/stores/shotData';
import { useGraphFilters } from '../../services/stores/graphFilters';
import { computed } from 'vue';
import InfoSection from './carouselContent/InfoSection.vue';
import { applyLeastEfficientFilters } from '../../services/selectors/headerModes';

const [emblaRef] = emblaCarouselVue()
const shotDataStore = useShotData()
const graphFiltersStore = useGraphFilters()

const filteredEntries = computed(() =>
  shotDataStore.getFilteredEntries(graphFiltersStore.selectedFilters, graphFiltersStore.hiddenCategories)
)

const metrics = [
  { title: 'Overall FG%', method: 'calcFG', suffix: '%' },
  { title: 'Current Frequency', method: 'getActiveFrequency', suffix: '%' },
]

const statCards = computed(() =>
  metrics.map(({ title, method, suffix = '', args = [] }) => {
    let value  
    if (title !== 'Total Points') {
      value = shotDataStore[method](...args, filteredEntries.value)
    } else {
      value = shotDataStore[method](...args)
    }
    return {
      title,
      stat: value + suffix
    }
  })
)

const handleOpen = () => {
  const popup = document.getElementById('box')
  popup.classList.add('modal-open')
}

// Mode toggle functionality
const toggleMode = (mode) => {
  graphFiltersStore.clearAll()

  // If already selected, toggle back to general
  if (graphFiltersStore.mode === mode) {
    graphFiltersStore.setMode('general')
    showToast("Chart behaviour reset")
  } else {
    graphFiltersStore.setMode(mode)
    
    switch (mode) {
      case 'most-common':
        showToast("Chart behaviour changed to find most common entries")
        break
      case 'least-efficient':
        showToast("Chart behaviour changed to find the least efficient entries")
        // applyLeastEfficientFilters() 
        break
    }
  }
}

// Check if a mode is active
const isModeActive = (mode) => {
  return graphFiltersStore.mode === mode
}

function showToast(message = "Operation successful") {
  const toast = document.getElementById("myToast");

  if (!toast) {
    console.warn("Toast element not found");
    return;
  }

  const span = toast.querySelector("span");
  if (span) {
    span.textContent = message;
  }

  toast.classList.remove("hidden", "opacity-0");

  setTimeout(() => {
    toast.classList.add("opacity-0");
    setTimeout(() => toast.classList.add("hidden"), 600);
  }, 2000);
}
</script>

<template>
  <div class="embla m-1" ref="emblaRef">
    <div class="embla__container">
      <SmallCard
        v-for="({ title, stat }, index) in statCards"
        :key="index"
        :title="title"
        :stat="stat"
      />
      
      <div class="card card-border bg-base-100 text-center min-w-[200px]">
        <div class="card-body py-1 px-2 gap-0">
            <h2 class="font-medium text-sm">Info</h2>
            <a class="underline cursor-pointer" @click="handleOpen">Open Documentation</a>
        </div>
      </div>

      <!-- Mode toggle buttons -->
      <div class="card card-border bg-base-100 text-center min-w-[200px]">
        <div class="card-body py-1 px-2 gap-0">
          <h2 class="font-medium text-sm mb-1">Chart Mode</h2>
          <div class="flex flex-row gap-1">
            <button 
              @click="toggleMode('general')" 
              :class="['btn btn-xs w-fit', isModeActive('general') ? 'btn-primary' : 'btn-outline']"
            >
              General
            </button>
            <button 
              @click="toggleMode('most-common')" 
              :class="['btn btn-xs w-fit', isModeActive('most-common') ? 'btn-primary' : 'btn-outline']"
            >
              Most Common
            </button>
            <button 
              @click="toggleMode('least-efficient')" 
              :class="['btn btn-xs w-fit', isModeActive('least-efficient') ? 'btn-primary' : 'btn-outline']"
            >
              Least Efficient
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <InfoSection/>
  
</template>

<style scoped>
.embla {
  overflow: hidden;
}
.embla__container {
  display: flex;
  gap: 0.5rem; 
}
.embla__slide {
  flex: 0 0 100%;
  min-width: 0;
}
</style>