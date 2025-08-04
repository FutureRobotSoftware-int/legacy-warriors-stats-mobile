<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { fetchGCSVideoUrl } from '../../../services/utils/getGCS'
import type { IShotData } from '../../../types/shotData'

const props = defineProps<{
  entry: IShotData,
  folderPath?: string // Cambiado de folderId a folderPath (opcional para subcarpetas en GCS)
}>()

const videoUrl = ref('')
const isLoading = ref(true)
const videoRef = ref<HTMLVideoElement | null>(null)
const player = ref<any>(null)

onMounted(async () => {
  try {
    // Obtener la URL del video desde GCS (con verificación HEAD opcional)
    const url = await fetchGCSVideoUrl(
      String(props.entry.id), 
      props.folderPath?.toLowerCase() // Ejemplo: "videos/torneos" (si tus videos están en `gs://mi-bucket/videos/torneos/123.mp4`)
    )

    console.log(url)

    if (url) {
      videoUrl.value = url
    } else {
      console.warn(`Video no encontrado en GCS: ID ${props.entry.id}`, props.folderPath?.toLowerCase())
    }
  } catch (error) {
    console.error('Error al cargar el video:', error)
  } finally {
    isLoading.value = false
  }

  // Inicializar el reproductor
  await nextTick()
  if (videoRef.value && videoUrl.value) {
    player.value = videojs(videoRef.value, {
      controls: true,
      preload: 'metadata',
      responsive: true,
      fluid: true
    }, () => {
      console.log('Player is ready')
    })
  }
})

onBeforeUnmount(() => {
  player.value?.dispose()
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
    </div>

    <!-- Video player -->
    <div v-else class="rounded-lg">
      <video
        ref="videoRef"
        class="video-js vjs-big-play-centered"
        preload="metadata"
        data-setup="{}"
      >
        <source :src="videoUrl" type="video/mp4" />
        <p class="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a
          web browser that
          <a href="https://videojs.com/html5-video-support/" target="_blank">
            supports HTML5 video
          </a>
        </p>
      </video>
    </div>
  </div>
</template>

<style>
/* Estilos personalizados (opcional) */
.video-js {
  --vjs-primary-color: #3a86ff;
}

.video-js .vjs-big-play-button {
  background-color: rgba(58, 134, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 2.5em;
  height: 2.5em;
  line-height: 2.5em;
  margin-left: -1.25em;
  margin-top: -1.25em;
}
</style>