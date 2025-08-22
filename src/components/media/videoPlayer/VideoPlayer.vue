<template>
  <div class="video-player-container">
    <video 
      ref="videoPlayer" 
      class="video-js vjs-big-play-centered vjs-16-9" 
      controls 
      preload="auto"
    ></video>
    
    <!-- Custom frame controls -->
    <div v-if="player" class="custom-frame-controls">
      <button @click="stepBackward" class="vjs-control vjs-button">
        <span class="vjs-control-content">&lt; 1f</span>
      </button>
      <button @click="stepForward" class="vjs-control vjs-button">
        <span class="vjs-control-content">1f &gt;</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  fps: {
    type: Number,
    default: 30
  }
})

const videoPlayer = ref(null)
const player = ref(null)
let videojs = null

const frameTime = ref(1 / props.fps)

onMounted(async () => {
  try {
    videojs = (await import('video.js')).default
    await import('video.js/dist/video-js.css')
    initializePlayer()
  } catch (error) {
    console.error('Error loading video player:', error)
  }
})

onBeforeUnmount(() => {
  if (player.value) {
    player.value.dispose()
  }
})

watch(() => props.src, (newSrc) => {
  if (player.value && newSrc) {
    player.value.src({ src: newSrc, type: 'video/mp4' })
  }
})

watch(() => props.fps, (newFps) => {
  frameTime.value = 1 / newFps
})

const initializePlayer = () => {
  if (!videojs || !videoPlayer.value) return

  player.value = videojs(videoPlayer.value, {
    controls: true,
    autoplay: props.autoplay,
    preload: 'auto',
    fluid: true,
    aspectRatio: '16:9',
    sources: [{
      src: props.src,
      type: 'video/mp4'
    }]
  }, () => {
    console.log('Player is ready')
  })
}

const stepForward = () => {
  if (player.value) {
    player.value.pause()
    const currentTime = player.value.currentTime()
    player.value.currentTime(currentTime + frameTime.value)
  }
}

const stepBackward = () => {
  if (player.value) {
    player.value.pause()
    const currentTime = player.value.currentTime()
    player.value.currentTime(Math.max(0, currentTime - frameTime.value))
  }
}

defineExpose({
  play: () => player.value && player.value.play(),
  pause: () => player.value && player.value.pause(),
  isPaused: () => player.value ? player.value.paused() : true,
  stepForward,
  stepBackward
})
</script>

<style scoped>
.video-player-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.custom-frame-controls {
  position: absolute;
  bottom: 35px; /* Position above video.js controls */
  right: 10px;
  z-index: 100;
  display: flex;
  gap: 5px;
}

.custom-frame-controls button {
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
}

.custom-frame-controls button:hover {
  background: rgba(0, 0, 0, 0.9);
}
</style>