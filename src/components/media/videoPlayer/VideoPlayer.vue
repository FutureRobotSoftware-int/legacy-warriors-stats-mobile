<template>
  <div class="video-player-container">
    <video 
      ref="videoPlayer" 
      class="video-js vjs-big-play-centered vjs-16-9" 
      controls 
      preload="auto"
    ></video>
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
  }
})

const videoPlayer = ref(null)
const player = ref(null)
let videojs = null

onMounted(async () => {
  try {
    // Load video.js first
    videojs = (await import('video.js')).default
    await import('video.js/dist/video-js.css')
    
    // Make videojs available globally for plugins that expect it
    window.videojs = videojs
    
    // Load the framebyframe plugin
    await import('@douglassllc/videojs-framebyframe/videojs.framebyframe.js')
    await import('@douglassllc/videojs-framebyframe/videojs.framebyframe.css')
    
    initializePlayer()
  } catch (error) {
    console.error('Error loading video player:', error)
  }
})

onBeforeUnmount(() => {
  if (player.value) {
    player.value.dispose()
  }
  // Clean up global reference
  if (window.videojs) {
    delete window.videojs
  }
})

watch(() => props.src, (newSrc) => {
  if (player.value && newSrc) {
    player.value.src({ src: newSrc, type: 'video/mp4' })
  }
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
    }],
    plugins: {
      framebyframe: {
        fps: 30,
        steps: [
          { text: '< 1f', step: -1 },
          { text: '1f >', step: 1 }
        ]
      }
    }
  }, () => {
    console.log('Player is ready')
  })
}

defineExpose({
  play: () => player.value && player.value.play(),
  pause: () => player.value && player.value.pause(),
  isPaused: () => player.value ? player.value.paused() : true
})
</script>

<style scoped>
.video-player-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
</style>