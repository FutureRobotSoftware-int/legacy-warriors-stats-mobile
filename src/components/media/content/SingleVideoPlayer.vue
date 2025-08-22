<script setup lang="ts">
import { ref, watch } from 'vue'
import { fetchGCSVideoUrl } from '../../../services/utils/getGCS'
import type { IShotData } from '../../../types/shotData'
import VideoPlayer from '../videoPlayer/VideoPlayer.vue'
import SingleTable from '../../tabs/SingleTable.vue'

const props = defineProps<{
  entry: IShotData,
  folderPath?: string
}>()

const videoUrl = ref('')
const isLoading = ref(true)

// Load video from GCS
async function loadVideo() {
  try {
    isLoading.value = true
    const url = await fetchGCSVideoUrl(
      String(props.entry.id), 
      props.folderPath?.toLowerCase()
    )

    if (url) {
      videoUrl.value = url
    } else {
      console.warn(`Video not found in GCS: ID ${props.entry.id}`, props.folderPath?.toLowerCase())
      videoUrl.value = ''
    }
  } catch (error) {
    console.error('Error loading video:', error)
    videoUrl.value = ''
  } finally {
    isLoading.value = false
  }
}

// Watch for changes to entry or folderPath
watch(() => [props.entry, props.folderPath], loadVideo, { immediate: true })

// Expose methods if needed
defineExpose({
  reload: loadVideo
})
</script>

<template>
  <div class="single-video-player space-y-4">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
      <span class="loading loading-spinner text-primary text-4xl"></span>
    </div>

    <!-- Video player with metadata table -->
    <div v-else class="flex flex-col justify-center items-center">
      <!-- Metadata table -->
      <div class="w-full mb-4">
        <SingleTable :metadata="entry" />
      </div>
      
      <!-- Video player or missing footage message -->
      <div v-if="videoUrl" class="w-full max-w-4xl">
        <VideoPlayer 
          :src="videoUrl" 
          :autoplay="false"
        />
      </div>
      
      <div v-else class="bg-base-200 border border-base-300 p-8 text-center rounded-md text-lg">
        <strong>No footage found</strong> for ID <code>{{ entry.id }}</code>.
      </div>
    </div>
  </div>
</template>

<style scoped>
.single-video-player {
  max-width: 100%;
  margin: 0 auto;
}
</style>