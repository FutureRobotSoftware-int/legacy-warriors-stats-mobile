<template>
    <main class="">
        <Carousel />
        <hr>
        <div>
            <TabSelector />
        </div>
        
    </main>
</template>

<script setup>
import Carousel from './cards/Carousel.vue';
import ChatsDisplay from './cards/ChartsDisplay.vue';
import { useShotData } from '../services/stores/shotData';
import { onMounted } from 'vue';
import { loadShotData } from '../services/data/dataLoader';
import { usePeriod } from '../services/stores/year';
import TabSelector from './TabSelector.vue';

const shotDataStore = useShotData()

onMounted(async () => {
    const result = await loadShotData("Moses Moody")

    const periodStore = usePeriod()

    periodStore.addPeriods()
})

</script>