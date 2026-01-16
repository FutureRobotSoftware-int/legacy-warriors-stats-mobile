<template>
    <div class="card card-border bg-base-100 text-center min-w-[200px]">
        <div class="card-body py-1 px-2 gap-0">
            <h2 class="font-medium text-sm">{{ title }}</h2>
            <p class="text-lg font-bold">{{ stat }}</p>
        </div>
    </div>
</template>

<script setup>

defineProps({
    title: String,
    stat: String,
});

</script>