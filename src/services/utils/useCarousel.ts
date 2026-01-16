import { ref, onMounted } from 'vue'
import useEmblaCarousel from 'embla-carousel-vue'
import { useShotData } from '../stores/shotData'
import { usePlayers } from '../stores/players'

export function useCarousel() {
    const playerStore = usePlayers()
    const shotData = useShotData()

    // Reactive state
    const mode = ref<'all' | 'random'>('all')
    const isLoading = ref(false)
    const showWarning = ref(false)
    const showMissingFootageWarning = ref(false)

    // Navigation button refs
    const prevBtn = ref<HTMLButtonElement | null>(null)
    const nextBtn = ref<HTMLButtonElement | null>(null)

    // Initialize Embla carousel
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: 'start',
        skipSnaps: false
    })

    // Get IDs based on current mode
    function getIdsByMode(): string[] {
        const ids = shotData.getActiveIds.map(id => String(id))

        showWarning.value = ids.length > 25
        showMissingFootageWarning.value = shotData.getActiveIds.some(id => Number(id) > 196)

        if (mode.value === 'random') {
            return ids.sort(() => Math.random() - 0.5).slice(0, 10)
        }
        return ids
    }

    // Update navigation buttons state
    const updateNavButtons = () => {
        if (!emblaApi.value) return

        const prevEnable = emblaApi.value.canScrollPrev()
        const nextEnable = emblaApi.value.canScrollNext()

        if (prevBtn.value) {
            prevBtn.value.disabled = !prevEnable
            prevBtn.value.style.opacity = prevEnable ? '1' : '0.5'
            prevBtn.value.style.cursor = prevEnable ? 'pointer' : 'not-allowed'
        }

        if (nextBtn.value) {
            nextBtn.value.disabled = !nextEnable
            nextBtn.value.style.opacity = nextEnable ? '1' : '0.5'
            nextBtn.value.style.cursor = nextEnable ? 'pointer' : 'not-allowed'
        }
    }

    // Setup carousel event listeners
    onMounted(() => {
        if (emblaApi.value) {
            emblaApi.value.on('select', handleSlideSelect)
            emblaApi.value.on('init', updateNavButtons)
        }
    })

    // Handle slide selection
    const handleSlideSelect = () => {
        if (!emblaApi.value) return

        const selectedIndex = emblaApi.value.selectedScrollSnap()
        updateNavButtons()
        return selectedIndex
    }

    return {
        mode,
        isLoading,
        showWarning,
        showMissingFootageWarning,
        prevBtn,
        nextBtn,
        emblaRef,
        emblaApi,
        playerStore,
        shotData,
        handleSlideSelect,
        getIdsByMode,
        updateNavButtons
    }
}