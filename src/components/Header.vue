<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { usePlayers } from "../services/stores/players";
import { usePeriod } from "../services/stores/year";
import { useGraphFilters } from "../services/stores/graphFilters";
import { loadPlayers } from "../services/data/dataLoader";

// Reactive state using TypeScript types for better type safety
const selectedPlayerId = ref<number | "">("");
const selectedPeriodId = ref<number | "">("");

// Pinia store instances
const playersStore = usePlayers();
const periodStore = usePeriod();
const graphFiltersStore = useGraphFilters();

/**
 * Watches for changes in graph filters and resets to default when filters are cleared
 */
watch(
  () => graphFiltersStore.selectedFilters,
  (newFilters) => {
    if (Object.keys(newFilters).length === 0) {
      periodStore.selectAllTime();

      if (periodStore.allTimePeriod) {
        selectedPeriodId.value = periodStore.allTimePeriod.id;
      }
    }
  },
  { deep: true }
);

/**
 * Initializes component - loads players and sets default selections
 */
onMounted(async () => {
  await loadPlayers();

  // Set first player as default if available
  if (playersStore.players.length > 0) {
    const firstPlayer = playersStore.players[0];
    selectedPlayerId.value = firstPlayer.id;
    playersStore.selectPlayer(firstPlayer);
  }
});

/**
 * Handles period selection change
 */
const handlePeriodChange = () => {
  const selected = periodStore.periods.find(
    (p) => p.id === selectedPeriodId.value
  );

  if (!selected) return;

  periodStore.selectPeriod(selected);
};


/**
 * Handles player selection change
 */
const handlePlayerChange = () => {
  const selected = playersStore.players.find(
    (p) => p.id === selectedPlayerId.value
  );

  if (!selected) return;

  playersStore.selectPlayer(selected);

  // 🔹 Reset periodo al cambiar jugador
  periodStore.selectAllTime();
  if (periodStore.allTimePeriod) {
    selectedPeriodId.value = periodStore.allTimePeriod.id;
  }
};

const availablePeriods = computed(() => {
  periodStore.refreshPeriods();
  return periodStore.allPeriods;
});
</script>

<template>
  <header class="bg-black p-0 text-white font-medium">
    <!-- Version info -->
    <p class="absolute text-sm">3BallBreakdown</p>
    <p class="absolute text-sm right-0">v.0.5.0</p>

    <!-- Main navigation controls -->
    <div class="flex items-center justify-between mx-24">
      <!-- Logo -->
      <div class="mx-4">
        <img
          src="../assets/BBALLBREAKDOWN-Social-Media-Icon-Medium.png"
          class="size-12"
          alt="Basketball Breakdown Logo"
        />
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

      <!-- Removed mode selection dropdown -->
    </div>
  </header>

  <div class="toast toast-bottom toast-end z-100" aria-live="polite">
    <!-- Toast -->
    <div
      id="myToast"
      class="alert alert-info hidden transition-opacity duration-300"
    >
      <span></span>
    </div>
  </div>
</template>
