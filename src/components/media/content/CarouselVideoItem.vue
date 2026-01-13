<script setup lang="ts">
import { ref, watch } from 'vue'
import { fetchGCSVideoUrl } from '../../../services/utils/getGCS'
import VideoPlayer from '../videoPlayer/VideoPlayer.vue'
import SingleTable from '../../tabs/SingleTable.vue'
import type { IShotData } from '../../../types/shotData'

const props = defineProps<{
  entry: IShotData
  playerSlug: string
  period: string | null
  autoplay?: boolean
}>()

const videoUrl = ref('')
const isLoading = ref(true)

async function loadVideo() {
  if (!props.playerSlug || !props.period || props.period === 'All time') {
    videoUrl.value = ''
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    const url = await fetchGCSVideoUrl(
      props.entry.id,
      props.playerSlug,
      props.entry.Year
    )
    videoUrl.value = url ?? ''
  } catch {
    videoUrl.value = ''
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [props.entry.id, props.playerSlug, props.period],
  loadVideo,
  { immediate: true }
)
</script>

<template>
  <SingleTable :metadata="entry" />

  <div v-if="isLoading" class="bg-gray-100 aspect-video flex items-center justify-center">
    <span class="loading loading-spinner text-primary"></span>
  </div>

  <VideoPlayer
    v-else-if="videoUrl"
    :src="videoUrl"
    :autoplay="autoplay"
  />

  <div
    v-else
    class="bg-base-200 border border-base-300 p-4 text-center rounded-md text-sm"
  >
    <strong>No footage found</strong> for ID <code>{{ entry.id }}</code>.
  </div>
</template>
