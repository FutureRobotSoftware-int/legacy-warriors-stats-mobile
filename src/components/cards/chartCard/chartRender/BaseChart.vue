<script setup lang="ts">
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart, BarChart, LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  GraphicComponent,
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { useGraphFilters } from "../../../../services/stores/graphFilters";
import { computed, provide } from "vue";
import { useShotData } from "../../../../services/stores/shotData";
import type { IShotData } from "../../../../types/shotData";

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  LineChart,
  GraphicComponent,
]);

provide(THEME_KEY, "light");
const props = defineProps({
  option: Object,
  width: { type: String, default: "100%" },
  height: { type: String, default: "100%" },
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

  const field = props.fieldKey!;

  // === MODE: MOST-COMMON  ===
  if (filters.getMode === "most-common") {
    filters.setFilter(field, params.name);

    const topEntries = shotData.getAllEntriesExceptTop();

    Object.entries(topEntries).forEach(([f, values]) => {
      if (f !== field) {
        filters.clearFilter(f);

        const valuesToHide = new Set(values);
        filters.$patch((state) => {
          if (valuesToHide.size > 0) {
            state.hiddenCategories = {
              ...state.hiddenCategories,
              [f]: valuesToHide,
            };
          }
        });
      }
    });
    return;
  }

  // === MODE: LEAST-EFFICIENT ===
  if (filters.getMode === "least-efficient") {
    filters.setFilter(field, params.name);

    const ignoredField = field as keyof IShotData;
    const toHideMap = shotData.getAllEntriesExceptLeastEfficientTop(
      3,
      7,
      undefined,
      shotData.getActiveEntries as IShotData[],
      ignoredField
    );

    Object.entries(toHideMap).forEach(([f, values]) => {
      if (f !== field) {
        filters.clearFilter(f);

        const valuesToHide = new Set(values);
        filters.$patch((state) => {
          if (valuesToHide.size > 0) {
            state.hiddenCategories = {
              ...state.hiddenCategories,
              [f]: valuesToHide,
            };
          } else {
            const { [f]: _, ...rest } = state.hiddenCategories;
            state.hiddenCategories = rest;
          }
        });
      }
    });

    return;
  }

  // === DEFAULT ===
  filters.setFilter(field, params.name);
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
        [fieldKey]: updatedHidden,
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
