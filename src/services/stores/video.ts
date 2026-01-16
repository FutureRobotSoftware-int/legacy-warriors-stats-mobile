import { defineStore } from 'pinia'

export const useVideoStore = defineStore('videoStore', {
    state: () => ({
        videos: [
            { id: 'video1', url: '1YIxtEQ0V4mcX1bvgLweu6c2JNWsVspxL', title: 'Primer video' },
            { id: 'video2', url: '1kH2jk10a6TaVHJD0r1lFsiek5GCByvAn', title: 'Segundo video' }
        ]
    }),
    getters: {
        videoIds: (state) => state.videos.map(v => v.id),
        videoURL: (state) => state.videos.map(v => v.url),
    }
})
