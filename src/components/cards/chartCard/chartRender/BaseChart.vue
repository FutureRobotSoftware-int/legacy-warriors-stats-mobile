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

  // === MODE: MOST-COMMON (como ya tienes) ===
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

  // === MODE: LEAST-EFFICIENT (interactivo, similar a most-common) ===
  if (filters.getMode === "least-efficient") {
    // Selecciona el filtro cliqueado
    filters.setFilter(field, params.name);

    // Calcula, para los otros campos relevantes, qué categorías ocultar
    const ignoredField = field as keyof IShotData;
    const toHideMap = shotData.getAllEntriesExceptLeastEfficientTop(
      3, // top N ineficientes a conservar
      7, // % mínimo de frecuencia
      undefined, // usa los campos por defecto: Area, Offensive Action, Pass Direction
      shotData.getActiveEntries as IShotData[], // dataset activo
      ignoredField // no tocar el campo cliqueado
    );

    // Aplica las ocultaciones dinámicamente a los otros campos
    Object.entries(toHideMap).forEach(([f, values]) => {
      if (f !== field) {
        filters.clearFilter(f); // Evita conflictos con filtros previos en otros campos

        const valuesToHide = new Set(values);
        filters.$patch((state) => {
          // Si el mapa viene vacío, no tocamos ese campo
          if (valuesToHide.size > 0) {
            state.hiddenCategories = {
              ...state.hiddenCategories,
              [f]: valuesToHide,
            };
          } else {
            // Si no hay nada que ocultar, limpiamos el hidden del campo
            const { [f]: _, ...rest } = state.hiddenCategories;
            state.hiddenCategories = rest;
          }
        });
      }
    });

    return;
  }

  // === DEFAULT (general) ===
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
