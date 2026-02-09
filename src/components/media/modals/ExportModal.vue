<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-base-100 rounded-lg shadow-lg w-72 p-4">
      <h2 class="text-lg font-semibold mb-4">Export Options</h2>

      <div class="space-y-2 max-h-60 overflow-y-auto">
        <label
          v-for="category in categories"
          :key="category"
          class="flex items-center justify-between"
        >
          <span class="text-sm">{{ category }}</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            v-model="localSelection[category]"
          />
        </label>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <button class="btn btn-ghost" @click="$emit('close')">
          Cancel
        </button>

        <button class="btn btn-primary" @click="exportData">
          Export
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const categories = [
  'Area',
  'Pass from Direction',
  'Offensive Action',
  'Footwork',
  'Off Dribble Hand',
  'Player Direction',
  'Defender Distance',
]

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'export', payload: Record<string, boolean>): void
}>()

const localSelection = reactive<Record<string, boolean>>(
  Object.fromEntries(categories.map(c => [c, true]))
)

function exportData() {
  emit('export', localSelection)
  emit('close')
}
</script>
