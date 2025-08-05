<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { usePlayers } from '../services/stores/players'
import { usePeriod } from '../services/stores/year'
import { useGraphFilters } from '../services/stores/graphFilters'
import { useShotData } from '../services/stores/shotData'
import { loadPlayers } from '../services/data/dataLoader'

const selectedPlayerId = ref<number | ''>('')
const selectedPeriodId = ref<number | ''>('')
const selectedMode = ref<'general' | 'most-common' | 'top-plays' | 'least-efficient'>('general')

const playersStore = usePlayers()
const periodStore = usePeriod()
const graphFiltersStore = useGraphFilters()
const shotDataStore = useShotData()

watch(() => graphFiltersStore.selectedFilters, (newFilters) => {
  if (Object.keys(newFilters).length === 0) {
    periodStore.selectAllTime();
    selectedMode.value = 'general';
    
    if (periodStore.allTimePeriod) {
      selectedPeriodId.value = periodStore.allTimePeriod.id;
    }
  }
}, { deep: true })


watch(selectedMode, (mode) => {
  console.log('Mode changed to:', mode)
  graphFiltersStore.setMode(mode)

  if (mode === 'general') {
    graphFiltersStore.clearAllGeneral()
    return
  }

  // Limpiar filtros para cualquier modo especial
  graphFiltersStore.clearAll()

  if (mode === 'most-common') {
    // Obtener la combinación más común de los 5 parámetros
    const mostCommonCombo = shotDataStore.getMostCommonCombination()
    
    // Aplicar los filtros
    Object.entries(mostCommonCombo).forEach(([field, value]) => {
      if (value) { // Solo aplicar si hay valor
        graphFiltersStore.setFilter(field, value)
      }
    })
  } else if (mode === 'top-plays') {
    const topPlaysByArea = shotDataStore.getTopPlaysByArea();
    
    // Seleccionar las áreas y acciones más comunes
    const areasToInclude = new Set<string>();
    const actionsToInclude = new Set<string>();
    
    topPlaysByArea.forEach(areaData => {
      areasToInclude.add(areaData.area);
      areaData.actions.forEach(action => {
        actionsToInclude.add(action.name);
      });
    });

    // Aplicar filtros
    areasToInclude.forEach(area => {
      graphFiltersStore.setFilter('Area', area);
    });
    
    actionsToInclude.forEach(action => {
      graphFiltersStore.setFilter('Offensive Action', action);
    });
    
  } else if (mode === 'least-efficient') {
    const leastEfficientByAction = shotDataStore.getLeastEfficientByAction();
    
    // Seleccionar las acciones y áreas menos eficientes
    const actionsToInclude = new Set<string>();
    const areasToInclude = new Set<string>();
    
    leastEfficientByAction.forEach(actionData => {
      actionsToInclude.add(actionData.action);
      actionData.areas.forEach(area => {
        areasToInclude.add(area.name);
      });
    });

    // Aplicar filtros
    actionsToInclude.forEach(action => {
      graphFiltersStore.setFilter('Offensive Action', action);
    });
    
    areasToInclude.forEach(area => {
      graphFiltersStore.setFilter('Area', area);
    });
  }
});

onMounted(async () => {
  await loadPlayers();

  const firstPlayer = playersStore.players[0];
  if (firstPlayer) {
    selectedPlayerId.value = firstPlayer.id;
    playersStore.selectPlayer(firstPlayer);
  }
})

function handlePeriodChange() {
  const selected = periodStore.periods.find(p => p.id === selectedPeriodId.value)
  if (selected) periodStore.selectPeriod(selected)
}

function handlePlayerChange() {
  const selected = playersStore.players.find(p => p.id === selectedPlayerId.value)
  if (selected) playersStore.selectPlayer(selected)
}
</script>

<template>
    <header class="bg-black p-0 text-white font-medium">
        <p class="absolute text-sm">ShotBreakdown</p>
        <p class="absolute text-sm right-0">v.0.3.4</p>
        <div class="flex items-center justify-between mx-24">
            <div class="mx-4">
                <img src="../assets/BBALLBREAKDOWN-Social-Media-Icon-Medium.png" class="size-12">
            </div>
            <div class="grow mx-4">
                <select name="" id="player-select" v-model="selectedPlayerId" @change="handlePlayerChange"
                    class="select select-md rounded-full border-base-100 bg-black border-2 focus:outline-base-100">
                    <option value="" class="lg:text-sm">-- Select a player --</option>
                    <option class="lg:text-sm" v-for="player in playersStore.players" :key="player.id"
                        :value="player.id">
                        {{ player.player }} #{{ player.number }}
                    </option>
                </select>
            </div>
            <div class="mx-4">
                <select
                    v-model="selectedPeriodId"
                    @change="handlePeriodChange"
                    class="select select-md rounded-full border-base-100 bg-black w-fit border-2 focus:outline-base-100"
                >
                    <option value="">-- Select a season --</option>
                    <option
                        v-for="period in periodStore.periods"
                        :key="period.id"
                        :value="period.id"
                        class="lg:text-sm"
                    >
                        {{ period.period }}
                    </option>
                </select>
            </div>
            <div class="mx-4">
                <select
                    v-model="selectedMode"
                    class="select select-md rounded-full border-base-100 bg-black w-fit border-2 focus:outline-base-100"
                >
                    <option value="">-- Select a mode --</option>
                    <option value="general" class="lg:text-sm">General</option>
                    <option value="most-common" class="lg:text-sm">Most Common</option>
                    <option value="top-plays" class="lg:text-sm">Top Plays</option>
                    <option value="least-efficient" class="lg:text-sm">Least Efficient</option>
                </select>
            </div>
        </div>
    </header>
</template>