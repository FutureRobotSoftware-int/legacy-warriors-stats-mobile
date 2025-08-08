<script setup lang="ts">
defineProps<{
  metadata: Record<string, any> | null
}>();

const fieldsToDisplay = [
  { key: 'id', label: 'id' },
  { key: 'Area', label: 'Area' },
  { key: 'Player Direction', label: 'Player Direction' },
  { key: 'Pass Direction', label: 'Pass Direction' },
  { key: 'Offensive Action', label: 'Offensive Action' },
  { key: 'Footwork', label: 'Footwork' },
  { key: 'Off Dribble Hand', label: 'Off Dribble Hand' },
  { key: 'Defender Distance', label: 'Defender Distance' },
  { key: 'PTS', label: 'PTS' },
  { key: 'Year', label: 'Year' },
];
</script>

<template>
  <div v-if="metadata" class="metadata-table mt-4">
    <table class="table table-zebra table-xs max-w-20">
      <thead>
        <tr>
          <th v-for="field in fieldsToDisplay" :key="field.key" class="bg-base-200">
            {{ field.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td v-for="field in fieldsToDisplay" :key="field.key">
            {{ metadata[field.key] || 'N/A' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>