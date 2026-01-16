<template>
  <div class="w-full flex justify-center py-4">
    <Slider
      v-model="months"
      :min="1"
      :max="12"
      :step="1"
      :lazy="true"
      class="w-full"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Slider from "@vueform/slider";
import "@vueform/slider/themes/default.css";

const months = ref([1, 12]);
</script>

<style scoped>
:deep(.slider-fill) {
  background-color: #3b82f6;
}
:deep(.slider-dot) {
  background-color: #3b82f6;
  border: 2px solid white;
}
</style>
