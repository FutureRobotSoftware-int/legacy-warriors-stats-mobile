<script setup>
import emblaCarouselVue from 'embla-carousel-vue'
import SmallCard from './SmallCard.vue';
import { useShotData } from '../../services/stores/shotData';
import { useGraphFilters } from '../../services/stores/graphFilters';
import { computed, ref } from 'vue';

const showModal = ref(false)

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
      <div class="card card-border bg-base-100 text-center min-w-[200px]">
        <div class="card-body py-1 px-2 gap-0">
            <h2 class="font-medium text-sm">Info</h2>
            <a class="underline cursor-pointer" @click="showModal = true">Open Documentation</a>
        </div>
      </div>
    </div>
  </div>

  <div class="modal p-0 min-w-dvh" :class="{ 'modal-open': showModal }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">ShotBreakdown Chart Behaviour</h3>
      <div class="py-4 space-y-3">
        <p>
          Each chart visualizes every variable involved in a 3-point shot attempt
          from the shooting area to the specific offensive action performed.
        </p>
        <p>The pie charts have two levels, the outer circle represents the Field Goal (FG%) and the inner one the Frequency (how many entries have) of that parameter</p>
        <p>
          All data is refined and grouped in its respective chart. However, each entry remains 
          interconnected, representing an individual shot attempt. 
        </p>
        <p>
          You can explore this analysis tool by selecting a <strong>mode</strong> or applying 
          custom filters of interest. The charts will update dynamically to reflect your selections.
        </p>

        <h4 class="font-semibold mt-4">Available Modes</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li>
            <strong>General:</strong> Default app behaviour. Displays all available data without additional filtering.
          </li>
          <li>
            <strong>Most Common:</strong> 
            Changes the behaviour of the filtering, now showing the top entries for the relevant charts, based on what value is selected.
          </li>
          <li>
            <strong>Key Highlights</strong>: 
            Shows the most relevant plays within the main concurrent areas. While "Most Common" focuses on 
            fine detail, this mode surfaces broader, high-impact insights.
          </li>
          <li>
            <strong>Least Efficient:</strong> Hides the highest FG% entries and removes low-frequency but 
            highly accurate plays that could bias the analysis.
          </li>
          <li>
            <strong>Custom:</strong> Activated whenever a user-defined filter is applied in any mode.
          </li>
        </ul>

        <h4 class="font-semibold mt-4">Extra Features</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li>In the Totals section, you can clear/show specific parameters previosly selected.</li>
          <li>See Footage will expand a video player for all the active entries.</li>
        </ul>
      </div>
      <div class="modal-action">
        <button class="btn" @click="showModal = false">Close</button>
      </div>
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
