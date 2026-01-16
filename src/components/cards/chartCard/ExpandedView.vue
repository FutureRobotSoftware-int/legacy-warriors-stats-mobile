<template>
    <div class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
        <div class="bg-base-100 expanded p-6 rounded-2xl shadow-lg w-[90%] max-w-5xl relative">
            <button @click="$emit('close')"
                class="absolute top-2 right-4 text-2xl font-bold hover:text-error">×</button>
            <h2 class="text-2xl font-bold mb-4">{{ title }} (Expanded)</h2>
            <slot></slot>
        </div>
    </div>
</template>

<script setup>

defineProps({ title: String })

</script>

<style scoped>

.expanded {
    height: 90dvh;
}

</style>