import { ref } from 'vue'
import VideoPlayer from '../../components/media/videoPlayer/VideoPlayer.vue'

export function useVideoPlayers() {
    const videoPlayers = ref<InstanceType<typeof VideoPlayer>[]>([])

    // Pause all video players
    const pauseAllPlayers = () => {
        videoPlayers.value.forEach((player) => {
            if (player) {
                player.pause()
            }
        })
    }

    // Play specific player and pause others
    const playPlayer = (index: number) => {
        videoPlayers.value.forEach((player, i) => {
            if (player) {
                if (i === index) {
                    player.play()
                } else {
                    player.pause()
                }
            }
        })
    }

    return {
        videoPlayers,
        pauseAllPlayers,
        playPlayer
    }
}