<template>
    <div class="relative">
        <div class="card bg-base-100 shadow-sm h-83 w-68.5 perspective overflow-visible">
            <div class="relative h-full w-full transition-transform duration-500 transform-style-preserve-3d">
                <CardFront :title="title" @expand="isExpanded = true">
                    <BaseChart :option="data" :fieldKey="fieldKey" :interactive="true" :filterable="true"/>
                </CardFront>
            </div>
        </div>

        <ExpandedView v-if="isExpanded" :title="title" @close="isExpanded = false">
            <BaseChart :option="altData" :fieldKey="fieldKey" :interactive="true" :filterable="true"/>
        </ExpandedView>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import ExpandedView from './ExpandedView.vue';
import CardFront from './CardFront.vue';
import BaseChart from './chartRender/BaseChart.vue';

const isExpanded = ref(false);

defineProps({
    title: String,
    data: Object,
    altData: Object,
    fieldKey: String,
});
</script>

<style scoped>
.perspective {
    perspective: 1000px;
}

.transform-style-preserve-3d {
    transform-style: preserve-3d;
}

.backface-hidden {
    backface-visibility: hidden;
}

.rotate-y-180 {
    transform: rotateY(180deg);
}
</style>
