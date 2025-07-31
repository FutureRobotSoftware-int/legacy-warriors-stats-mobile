<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  GraphicComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { useGraphFilters } from '../../../../services/stores/graphFilters';
import { provide } from 'vue';

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  LineChart,
  GraphicComponent
]);

provide(THEME_KEY, 'light');

const props = defineProps({
  option: Object,
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' },
  fieldKey: String,
  interactive: { type: Boolean, default: true },
  filterable: { type: Boolean, default: true },
})

const filters = useGraphFilters()

function handleClick(params: any) {
  if (!props.interactive || !props.fieldKey) return
  filters.setFilter(props.fieldKey, params.name)
}

function handleLegendToggle(params: any) {
  if (!props.interactive || !props.fieldKey) return;
  
  // Crear un nuevo objeto para las categorías ocultas
  const newHiddenCategories = { ...filters.hiddenCategories };
  
  if (!newHiddenCategories[props.fieldKey]) {
    newHiddenCategories[props.fieldKey] = new Set();
  } else {
    // Crear un nuevo Set para evitar mutaciones directas
    newHiddenCategories[props.fieldKey] = new Set(newHiddenCategories[props.fieldKey]);
  }
  
  // Actualizar las categorías ocultas basadas en la selección
  Object.entries(params.selected).forEach(([name, isSelected]) => {
    if (!isSelected) {
      newHiddenCategories[props.fieldKey!].add(name);
    } else {
      newHiddenCategories[props.fieldKey!].delete(name);
    }
  });
  
  // Eliminar el campo si no hay categorías ocultas
  if (newHiddenCategories[props.fieldKey!].size === 0) {
    delete newHiddenCategories[props.fieldKey!];
  }
  
  // Actualizar el store
  filters.hiddenCategories = newHiddenCategories;
}

</script>

<template>
  <v-chart
    class="chart"
    :option="option"
    autoresize
    :style="{ width, height }"
    @click="handleClick"
    @legendselectchanged="handleLegendToggle"
  />
</template>
  
<style scoped>
.chart {
  display: block;
}
</style>
