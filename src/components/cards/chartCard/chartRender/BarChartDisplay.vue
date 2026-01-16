<script setup>
import { computed } from 'vue'
import { useShotData } from '../../../../services/stores/shotData'
import { useGraphFilters } from '../../../../services/stores/graphFilters'
import { buildBarChartOption } from '../../../../services/charts/buildChart'
import CardFront from '../CardFront.vue'
import BaseChart from './BaseChart.vue'
import ExpandedView from '../ExpandedView.vue'
import { ref } from 'vue';

const isExpanded = ref(false);

const shotDataStore = useShotData()
const filters = useGraphFilters()

const barChartData = computed(() => {
  const entries = shotDataStore.getFilteredEntries(
    filters.selectedFilters,
    filters.hiddenCategories,
    null,
    false
  )

  const { actions, series } = shotDataStore.getStackedPPPAndFrequencyByActionArea(entries)
  return buildBarChartOption(actions, series)
})



</script>

<template>
  <div class="relative mb-4 w-full">
    <div class="card bg-base-100 w-full h-full perspective overflow-hidden">
      <div class="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d">
          <CardFront title="Offensive Action per PPP" @expand="isExpanded = true">
              <BaseChart :option="barChartData" fieldKey="Offensive Action" :interactive="true" :filterable="true"/>
          </CardFront>
      </div>
    </div>

    <ExpandedView v-if="isExpanded" title="Offensive Action per PPP" @close="isExpanded = false">
        <BaseChart height="90%" :option="barChartData" fieldKey="Offensive Action" :interactive="true" :filterable="true"/>
    </ExpandedView>
  </div>
</template>

<style scoped>
.perspective {
    perspective: 1000px;
}

.transform-style-preserve-3d {
    transform-style: preserve-3d;
}

.backface-hidden {
    backface-visibility: hidden;
}

.rotate-y-180 {
    transform: rotateY(180deg);
}
</style>