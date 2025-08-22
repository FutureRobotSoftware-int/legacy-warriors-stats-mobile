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
import { computed, provide } from 'vue';
import { useShotData } from '../../../../services/stores/shotData';

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
});

const filters = useGraphFilters();
const shotData = useShotData();

// Computed property to check if interactive actions should be enabled
const isInteractive = computed(() => props.interactive && props.fieldKey);

function handleClick(params: { name: string }) {
  if (!isInteractive.value) return;

  if (filters.getMode === "most-common") {
    // Set the clicked filter
    filters.setFilter(props.fieldKey!, params.name);
    
    // Get top entries for all key parameters based on current filters
    const topEntries = shotData.getAllEntriesExceptTop();
    
    // Apply these top entries to the filters
    Object.entries(topEntries).forEach(([field, values]) => {
      // Skip the field we just clicked on
      if (field !== props.fieldKey) {
        filters.clearFilter(field);

        // Create a Set with the values to hide (from topEntries)
        const valuesToHide = new Set(values);
        
        // Update filters store immutably
        filters.$patch((state) => {
          if (valuesToHide.size > 0) {
            state.hiddenCategories = {
              ...state.hiddenCategories,
              [field]: valuesToHide
            };
          }
        });
      }
    });
  } else {
    filters.setFilter(props.fieldKey!, params.name);
  }
}

function handleLegendToggle(params: { selected: Record<string, boolean> }) {
  if (!isInteractive.value) return;
  
  const fieldKey = props.fieldKey!;
  const { selected } = params;
  
  // Create a new Set with updated hidden categories
  const updatedHidden = new Set<string>();
  
  for (const [name, isSelected] of Object.entries(selected)) {
    if (!isSelected) {
      updatedHidden.add(name);
    }
  }
  
  // Update filters store immutably
  filters.$patch((state) => {
    if (updatedHidden.size > 0) {
      state.hiddenCategories = {
        ...state.hiddenCategories,
        [fieldKey]: updatedHidden
      };
    } else {
      // Remove the field if no hidden categories
      const { [fieldKey]: _, ...rest } = state.hiddenCategories;
      state.hiddenCategories = rest;
    }
  });
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
  min-height: 100px; /* Ensure chart has minimum height */
}
</style>