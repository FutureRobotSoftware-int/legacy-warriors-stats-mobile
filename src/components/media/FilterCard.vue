<template>
  <div class="relative m-1">
    <div class="card bg-base-100 shadow-sm h-83 w-68.5 perspective overflow-y-auto">
      <div class="relative h-full w-full">
        <div class="h-full card-body text-center p-1">
          <FilterSummary @expand="isExpanded = true" @export="showExport = true" />
        </div>
      </div>
    </div>

    <ExpandedView v-if="isExpanded" title="Game Footage" @close="isExpanded = false">
      <FootageCarousel />
    </ExpandedView>

    <ExportModal v-if="showExport" @close="showExport = false" @export="handleExport" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FilterSummary from './content/FilterSummary.vue'
import ExpandedView from '../cards/chartCard/ExpandedView.vue'
import FootageCarousel from './content/FootageCarousel.vue'
import ExportModal from './modals/ExportModal.vue'
import { useShotData } from '../../services/stores/shotData'
import { exportToCSV } from '../../services/utils/exportUtils'

const isExpanded = ref(false)
const showExport = ref(false)

const shotData = useShotData()

function handleExport(selection: Record<string, boolean>) {
  exportToCSV(shotData.getActiveEntries, selection)
}
</script>
