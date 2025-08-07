<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { usePlayers } from '../services/stores/players'
import { usePeriod } from '../services/stores/year'
import { useGraphFilters } from '../services/stores/graphFilters'
import { useShotData } from '../services/stores/shotData'
import { loadPlayers } from '../services/data/dataLoader'

// Reactive state using TypeScript types for better type safety
const selectedPlayerId = ref<number | ''>('')
const selectedPeriodId = ref<number | ''>('')
const selectedMode = ref<'general' | 'most-common' | 'top-plays' | 'least-efficient'>('general')

// Pinia store instances
const playersStore = usePlayers()
const periodStore = usePeriod()
const graphFiltersStore = useGraphFilters()
const shotDataStore = useShotData()

/**
 * Watches for changes in graph filters and resets to default when filters are cleared
 */
watch(
  () => graphFiltersStore.selectedFilters,
  (newFilters) => {
    if (Object.keys(newFilters).length === 0) {
      periodStore.selectAllTime()
      selectedMode.value = 'general'
      
      if (periodStore.allTimePeriod) {
        selectedPeriodId.value = periodStore.allTimePeriod.id
      }
    }
  },
  { deep: true }
)

/**
 * Handles mode changes and applies corresponding filters
 */
watch(selectedMode, (mode) => {
  graphFiltersStore.setMode(mode)

  // Reset filters for general mode
  if (mode === 'general') {
    graphFiltersStore.clearAllGeneral()
    return
  }

  // Clear all filters for special modes
  graphFiltersStore.clearAll()

  switch (mode) {
    case 'most-common':
      applyMostCommonFilters()
      break
    case 'top-plays':
      applyTopPlaysFilters()
      break
    case 'least-efficient':
      applyLeastEfficientFilters()
      break
  }
})

/**
 * Applies filters for most common shot combinations
 */
const applyMostCommonFilters = () => {
  const mostCommonCombo = shotDataStore.getMostCommonCombination()
  Object.entries(mostCommonCombo).forEach(([field, value]) => {
    if (value) {
      graphFiltersStore.setFilter(field, value)
    }
  })
}

/**
 * Applies filters for top plays by area
 */
const applyTopPlaysFilters = () => {
  const topPlaysByArea = shotDataStore.getTopPlaysByArea()
  const areasToInclude = new Set<string>()
  const actionsToInclude = new Set<string>()
  
  topPlaysByArea.forEach(areaData => {
    areasToInclude.add(areaData.area)
    areaData.actions.forEach(action => {
      actionsToInclude.add(action.name)
    })
  })

  areasToInclude.forEach(area => graphFiltersStore.setFilter('Area', area))
  actionsToInclude.forEach(action => graphFiltersStore.setFilter('Offensive Action', action))
}

/**
 * Applies filters for least efficient plays
 */
const applyLeastEfficientFilters = () => {
  const leastEfficientByAction = shotDataStore.getLeastEfficientByAction()
  const actionsToInclude = new Set<string>()
  const areasToInclude = new Set<string>()
  
  leastEfficientByAction.forEach(actionData => {
    actionsToInclude.add(actionData.action)
    actionData.areas.forEach(area => {
      areasToInclude.add(area.name)
    })
  })

  actionsToInclude.forEach(action => graphFiltersStore.setFilter('Offensive Action', action))
  areasToInclude.forEach(area => graphFiltersStore.setFilter('Area', area))
}

/**
 * Initializes component - loads players and sets default selections
 */
onMounted(async () => {
  await loadPlayers()

  // Set first player as default if available
  if (playersStore.players.length > 0) {
    const firstPlayer = playersStore.players[0]
    selectedPlayerId.value = firstPlayer.id
    playersStore.selectPlayer(firstPlayer)
  }
})

/**
 * Handles period selection change
 */
const handlePeriodChange = () => {
  const selected = periodStore.periods.find(p => p.id === selectedPeriodId.value)
  if (selected) periodStore.selectPeriod(selected)
}

/**
 * Handles player selection change
 */
const handlePlayerChange = () => {
  const selected = playersStore.players.find(p => p.id === selectedPlayerId.value)
  if (selected) playersStore.selectPlayer(selected)
}

const availablePeriods = computed(() => {
  periodStore.refreshPeriods();

  return periodStore.allPeriods
})

</script>

<template>
  <header class="bg-black p-0 text-white font-medium">
    <!-- Version info -->
    <p class="absolute text-sm">ShotBreakdown</p>
    <p class="absolute text-sm right-0">v.0.3.4</p>
    
    <!-- Main navigation controls -->
    <div class="flex items-center justify-between mx-24">
      <!-- Logo -->
      <div class="mx-4">
        <img 
          src="../assets/BBALLBREAKDOWN-Social-Media-Icon-Medium.png" 
          class="size-12"
          alt="Basketball Breakdown Logo"
        >
      </div>
      
      <!-- Player selection -->
      <div class="grow mx-4">
        <select 
          id="player-select" 
          v-model="selectedPlayerId" 
          @change="handlePlayerChange"
          class="select select-md rounded-full border-base-100 bg-black border-2 focus:outline-base-100"
          aria-label="Select a player"
        >
          <option value="">-- Select a player --</option>
          <option 
            v-for="player in playersStore.players" 
            :key="player.id"
            :value="player.id"
          >
            {{ player.player }}
          </option>
        </select>
      </div>
      
      <!-- Season selection -->
      <div class="mx-4">
        <select
          v-model="selectedPeriodId"
          @change="handlePeriodChange"
          class="select select-md rounded-full border-base-100 bg-black w-fit border-2 focus:outline-base-100"
          aria-label="Select a season"
        >
          <option value="">-- Select a season --</option>
          <option
            v-for="period in availablePeriods"
            :key="period.id"
            :value="period.id"
          >
            {{ period.period }}
          </option>
        </select>
      </div>
      
      <!-- Mode selection -->
      <div class="mx-4">
        <select
          v-model="selectedMode"
          class="select select-md rounded-full border-base-100 bg-black w-fit border-2 focus:outline-base-100"
          aria-label="Select a mode"
        >
          <option value="">-- Select a mode --</option>
          <option value="general">General</option>
          <option value="most-common">Most Common</option>
          <option value="top-plays">Top Plays</option>
          <option value="least-efficient">Least Efficient</option>
        </select>
      </div>
    </div>
  </header>
</template>