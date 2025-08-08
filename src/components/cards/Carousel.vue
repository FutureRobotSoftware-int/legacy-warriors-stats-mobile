<script setup>
import emblaCarouselVue from 'embla-carousel-vue'
import SmallCard from './SmallCard.vue';
import { useShotData } from '../../services/stores/shotData';
import { useGraphFilters } from '../../services/stores/graphFilters';
import { computed } from 'vue';

const [emblaRef] = emblaCarouselVue()
const shotDataStore = useShotData()
const filters = useGraphFilters()

const filteredEntries = computed(() =>
  shotDataStore.getFilteredEntries(filters.selectedFilters, filters.hiddenCategories)
)

const metrics = [
  { title: 'Overall FG%', method: 'calcFG', suffix: '%' },
  { title: 'Average PPP', method: 'calcPPP' },
  { title: 'Total Points', method: 'calcTotalPoints' },
  // { title: 'Preferred Dribble Hand', method: 'getMostCommonColumnValue', args: ['Off Dribble Hand'] },
  // { title: 'Preferred Footwork', method: 'getMostCommonColumnValue', args: ['Footwork'] },
  // { title: 'Preferred Off.', method: 'getMostCommonColumnValue', args: ['Offensive Action'] },
  // { title: 'Frequent Def. Distance', method: 'getMostCommonColumnValue', args: ['Defender Distance'] },
  // { title: 'Least Eff. Off', method: 'getLeastEffectiveColumnValue', args: ['Offensive Action'] },
  // { title: 'Least Eff. Area', method: 'getLeastEffectiveColumnValue', args: ['Area'] },
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
    </div>
  </div>
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
