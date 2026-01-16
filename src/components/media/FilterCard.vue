<template>
    <div class="relative m-1">
        <div class="card bg-base-100 shadow-sm h-83 w-68.5 perspective overflow-y-auto">
          <div class="relative h-full w-full transition-transform duration-500 transform-style-preserve-3d">
            <div class="absolute inset-0 backface-hidden">
              <div class="h-full card-body text-center p-1">
                <FilterSummary @expand="isExpanded = true" />
              </div>
            </div>
          </div>
        </div>

        <ExpandedView v-if="isExpanded" title="Game Footage" @close="isExpanded = false">
          <FootageCarousel />
        </ExpandedView>
    </div>
</template>

<script setup>
import FilterSummary from './content/FilterSummary.vue';
import ExpandedView from '../cards/chartCard/ExpandedView.vue';
import { ref } from 'vue';
import FootageCarousel from './content/FootageCarousel.vue';

const isExpanded = ref(false);
</script>