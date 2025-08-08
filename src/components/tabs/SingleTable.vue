<script setup lang="ts">
defineProps<{
  metadata: Record<string, any> | null
}>();

// Define los campos que quieres mostrar en la tabla
const fieldsToDisplay = [
  { key: 'id', label: 'id' },
  { key: 'Area', label: 'Area' },
  { key: 'Player Direction', label: 'Player Direction' },
  { key: 'Pass Direction', label: 'Pass Direction' },
  { key: 'Offensive Action', label: 'Offensive Action' },
  { key: 'Footwork', label: 'Footwork' },
  { key: 'Make/Miss', label: 'Make/Miss' },
  { key: 'Off Dribble Hand', label: 'Off Dribble Hand' },
  { key: 'Defender Distance', label: 'Defender Distance' },
  { key: 'PTS', label: 'PTS' },
  { key: 'Year', label: 'Year' },
];
</script>

<template>
  <div v-if="metadata" class="metadata-table mt-4">
    <table class="table table-zebra table-xs w-full">
      <tbody>
        <tr v-for="field in fieldsToDisplay" :key="field.key">
          <th class="bg-base-200 w-1/3">{{ field.label }}</th>
          <td>{{ metadata[field.key] || 'N/A' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>