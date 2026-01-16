<script setup lang="ts">
import { ref } from 'vue'
import ChartsDisplay from './cards/ChartsDisplay.vue'
import Table from './tabs/Table.vue'
import BarChartDisplay from './cards/chartCard/chartRender/BarChartDisplay.vue'

const tabs = ['3PTS','Charts', 'Raw Data']
const selected = ref(0)
</script>

<template>
    <div class="flex h-[calc(92.5dvh-4rem)] border border-gray-200 rounded-lg overflow-hidden m-0.5">
      <div class="flex flex-col bg-base-200">
        <button
          v-for="(tab, idx) in tabs"
          :key="tab"
          @click="selected = idx"
          class="px-0 py-2 h-full w-8 border-b border-base-300 hover:bg-base-300 transition-all font-medium"
          :class="selected === idx ? 'bg-base-100 font-semibold' : ''"
        >
          <span class="rotate-[-90deg] block text-sm">
            {{ tab }}
          </span>
        </button>
      </div>
  
      <div class="flex-1 flex flex-col bg-base-100">
        <div v-if="selected === 0" class="flex-1 overflow-y-auto">
          <div class="flex flex-wrap h-full justify-between">
            <BarChartDisplay />
          </div>
        </div>
        <div v-else-if="selected === 1" class="flex-1 overflow-y-auto">
          <div class="m-1">
            <ChartsDisplay />
          </div>
        </div>
        <div v-else-if="selected === 2" class="flex-1 overflow-y-auto">
          <div class="m-4">
            <Table></Table>
          </div>
        </div>
      </div>
    </div>
  </template>
  