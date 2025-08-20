<script setup>
import emblaCarouselVue from 'embla-carousel-vue'
import SmallCard from './SmallCard.vue';
import { useShotData } from '../../services/stores/shotData';
import { useGraphFilters } from '../../services/stores/graphFilters';
import { computed, ref } from 'vue';
import InfoSection from './carouselContent/infoSection.vue'

const [emblaRef] = emblaCarouselVue()
const shotDataStore = useShotData()
const filters = useGraphFilters()

const filteredEntries = computed(() =>
  shotDataStore.getFilteredEntries(filters.selectedFilters, filters.hiddenCategories)
)

const metrics = [
  { title: 'Overall FG%', method: 'calcFG', suffix: '%' },
  { title: 'Average PPP', method: 'calcPPP' },
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
