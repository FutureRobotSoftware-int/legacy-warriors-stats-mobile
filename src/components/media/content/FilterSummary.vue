<template>
  <div class="">
    <h2 class="text-xl font-semibold mb-1">Totals</h2>

    <p class="text-base">
      <strong class="">Active Entries: </strong>
      <span class="font-mono">{{ filteredCount }}/{{ totalCount }} ({{ frequency }}%)</span>
    </p>

    <div v-if="hasFilters" class="mb-2">
      <p class="font-semibold">Current Filters:</p>
      <ul class="list-disc list-inside text-sm mt-1">
        <li v-for="(valueSet, key) in selectedFilters" :key="key" class="group">
          {{ key }}:
          <span class="font-mono">
            {{ Array.from(valueSet).join(', ') }}
          </span>
          <button 
            @click.stop="clearFilter(key)"
            class="ml-2 text-xs btn btn-xs btn-ghost"
            title="Clear this filter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd" />
            </svg>
          </button>
        </li>
      </ul>
    </div>

    <div v-if="hasHiddenCategories" class="mb-4">
      <p class="font-semibold">Hidden Categories:</p>
      <ul class="list-disc list-inside text-sm mt-1">
        <li v-for="(hiddenSet, key) in hiddenCategories" :key="'hidden-'+key" class="group">
          {{ key }}:
          <span class="font-mono">
            {{ Array.from(hiddenSet).join(', ') }}
          </span>
          <button 
            @click.stop="showCategory(key)"
            class="ml-2 text-xs btn btn-xs btn-ghost"
            title="Show all categories"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd" />
            </svg>
          </button>
        </li>
      </ul>
    </div>

    <div class="flex flex-wrap justify-center gap-2 mt-4">
      <button
        @click="clearFilters"
        class="btn btn-error text-error-content"
      >
        Clear Filters
      </button>

      <button 
        v-if="hasHiddenCategories"
        @click="clearHiddenCategories"
        class="btn btn-warning text-warning-content"
      >
        Show Hidden
      </button>

      <button 
        @click="$emit('expand')" 
        class="btn btn-info text-info-content"
      >
        See Footage
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useShotData } from '../../../services/stores/shotData'
import { useGraphFilters } from '../../../services/stores/graphFilters'

const shotDataStore = useShotData()
const filters = useGraphFilters()

const selectedFilters = computed(() => filters.selectedFilters)
const hiddenCategories = computed(() => filters.hiddenCategories)

const hasFilters = computed(() => {
    return Object.keys(selectedFilters.value).length > 0
})

const hasHiddenCategories = computed(() => {
    return Object.keys(hiddenCategories.value).length > 0
})

const filteredEntries = computed(() =>
    shotDataStore.getFilteredEntries(filters.selectedFilters, filters.hiddenCategories)
)

const totalCount = computed(() => shotDataStore.getAll.length)
const filteredCount = computed(() => filteredEntries.value.length)

const frequency = computed(() => {
  return totalCount.value ? Math.round((filteredCount.value / totalCount.value) * 100) : 0
})

function clearFilters() {
    filters.clearAll()
}

function clearFilter(field: string) {
    filters.clearFilter(field)
    filters.setMode('custom')
}

function clearHiddenCategories() {
    filters.hiddenCategories = {}
    filters.setMode('custom')
}

function showCategory(field: string) {
    if (filters.hiddenCategories[field]) {
        const newHiddenCategories = {...filters.hiddenCategories}
        delete newHiddenCategories[field]
        filters.hiddenCategories = newHiddenCategories
    }
}
</script>