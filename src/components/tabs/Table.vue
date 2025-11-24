<script setup lang="ts">
import { computed, ref } from "vue";
import { useShotData } from "../../services/stores/shotData";
import ExpandedView from "../cards/chartCard/ExpandedView.vue";
import SingleVideoPlayer from "../media/content/SingleVideoPlayer.vue";
import type { IShotData } from "../../types/shotData";
import { usePlayers } from "../../services/stores/players";

const shotDataStore = useShotData();
const playerStore = usePlayers();
const entries = computed(() => shotDataStore.getActiveEntries);

const showExpanded = ref(false);
const selectedEntry = ref<IShotData | null>(null);

function openVideo(entry: any) {
  selectedEntry.value = entry;
  showExpanded.value = true;
  console.log(selectedEntry);
}

function closeVideo() {
  showExpanded.value = false;
  selectedEntry.value = null;
}
</script>

<template>
  <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
    <!-- <p v-if="!videoUrl && !isLoading" class="text-center text-red-500 mt-4">
      Footage not found.
    </p> -->
    <table class="table table-zebra table-xs w-full">
      <thead class="sticky top-0 bg-base-200 z-10">
        <tr>
          <th
            v-for="key in Object.keys(entries[0] || {})"
            :key="key"
            class="text-xs"
          >
            {{ key }}
          </th>
          <th class="text-xs">Video</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in entries" :key="index">
          <td v-for="(value, key) in entry" :key="key" class="text-xs">
            {{ value }}
          </td>
          <td>
            <button class="btn btn-sm btn-info" @click="openVideo(entry)">
              Watch
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <ExpandedView
    v-if="showExpanded && selectedEntry"
    :title="'Play ID: ' + selectedEntry.id"
    @close="closeVideo"
  >
    <SingleVideoPlayer
      :entry="selectedEntry"
      :folderPath="playerStore.selectedPlayer?.data"
    />
  </ExpandedView>
</template>
