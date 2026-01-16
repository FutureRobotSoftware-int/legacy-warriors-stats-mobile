<template>
    <div class="absolute inset-0 backface-hidden">
        <div class="h-full card-body text-center p-1">
            <div class="flex items-center justify-center">
                <h2 class="text-xl font-semibold">{{ title }}</h2>
                <button @click="$emit('expand')" class=" absolute right-2 top-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                </button>
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<script setup>

defineProps({ title: String })

</script>