<script setup>
import ChartCard from './chartCard/ChartCard.vue'
import { computed } from 'vue'
import { useShotData } from '../../services/stores/shotData'
import { useGraphFilters } from '../../services/stores/graphFilters'
import { buildChartOption, buildBarChartOption } from '../../services/charts/buildChart'
import CardFront from './chartCard/CardFront.vue'
import BaseChart from './chartCard/chartRender/BaseChart.vue'
import ExpandedView from './chartCard/ExpandedView.vue'
import { ref } from 'vue';
import FilterCard from '../media/FilterCard.vue'

defineProps({
    title: String,
    data: Object,
    altData: Object,
    fieldKey: String,
});

const shotDataStore = useShotData()
const filters = useGraphFilters()

const mode = computed(() => filters.mode)

const metrics = [
  { title: 'Area', legend: 'getUniqueColumnValues', fieldGoal: 'getFGByColumn', data: 'getGroupedData', args: ['Area'], isOffPl: false },
  { title: 'Pass from Direction', legend: 'getUniqueColumnValues', fieldGoal: 'getFGByColumn', data: 'getGroupedData', args: ['Pass Direction'], isOffPl: false },
  { title: 'Offensive Action', legend: 'getUniqueColumnValues', fieldGoal: 'getFGByColumn', data: 'getGroupedData', args: ['Offensive Action'], isOffPl: true },
  { title: 'Footwork', legend: 'getUniqueColumnValues', fieldGoal: 'getFGByColumn', data: 'getGroupedData', args: ['Footwork'], isOffPl: false },
  { title: 'Off Dribble Hand', legend: 'getUniqueColumnValues', fieldGoal: 'getFGByColumn', data: 'getGroupedData', args: ['Off Dribble Hand'], isOffPl: false },
  { title: 'Player Direction', legend: 'getUniqueColumnValues', fieldGoal: 'getFGByColumn', data: 'getGroupedData', args: ['Player Direction'], isOffPl: false },
  { title: 'Defender Distance', legend: 'getUniqueColumnValues', fieldGoal: 'getFGByColumn', data: 'getGroupedData', args: ['Defender Distance'], isOffPl: false },
]

const filteredEntries = (fieldKey) =>
  shotDataStore.getFilteredEntries(
    filters.selectedFilters, 
    filters.hiddenCategories, 
    fieldKey, 
    false
)

const enrichedData = computed(() =>
  metrics.map((metric) => {
    const fieldKey = metric.args[0]
    const dataset = filteredEntries(fieldKey)

    // In most-common mode, we might want to highlight top items
    if (mode.value === 'most-common') {
      const topItems = filters.getTopItems(fieldKey);
    }

    const values = shotDataStore[metric.data](...metric.args, dataset)
    const fg =
      mode.value === 'inefficiencies'
        ? shotDataStore.getInefficiencyByColumn(...metric.args, dataset)
        : shotDataStore.getFGByColumn(...metric.args, dataset)

    const col = shotDataStore[metric.legend](...metric.args, dataset)

    const option = buildChartOption({ title: metric.title, values, fg, col }, false, metric.isOffPl)
    const altOption = buildChartOption({ title: metric.title, values, fg, col }, true)

    return {
      ...metric,
      option,
      altOption,
    }
  })
)

</script>

<template>

  <div class="flex flex-wrap">
    <ChartCard
      v-for="(chart, index) in enrichedData"
      :key="index"
      :data="chart.option"
      :altData="chart.altOption"
      :title="chart.title"
      :fieldKey="chart.args[0]"
      class="m-1"
    />
    <FilterCard />
  </div>
</template>