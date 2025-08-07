import { useGraphFilters } from "../stores/graphFilters";
import { useShotData } from "../stores/shotData"

/**
 * Applies filters for most common shot combinations
 */
export const applyMostCommonFilters = () => {
    const shotDataStore = useShotData();
    const graphFiltersStore = useGraphFilters();
    const mostCommonCombo = shotDataStore.getMostCommonCombination()
    Object.entries(mostCommonCombo).forEach(([field, value]) => {
        if (value) {
            graphFiltersStore.setFilter(field, value)
        }
    })
}

/**
 * Applies filters for top plays by area
 */
export const applyTopPlaysFilters = () => {
    const shotDataStore = useShotData();
    const graphFiltersStore = useGraphFilters();
    const topPlaysByArea = shotDataStore.getTopPlaysByArea()
    const areasToInclude = new Set<string>()
    const actionsToInclude = new Set<string>()

    topPlaysByArea.forEach(areaData => {
        areasToInclude.add(areaData.area)
        areaData.actions.forEach(action => {
            actionsToInclude.add(action.name)
        })
    })

    areasToInclude.forEach(area => graphFiltersStore.setFilter('Area', area))
    actionsToInclude.forEach(action => graphFiltersStore.setFilter('Offensive Action', action))
}

/**
 * Applies filters for least efficient plays
 */
export const applyLeastEfficientFilters = () => {
    const shotDataStore = useShotData();
    const graphFiltersStore = useGraphFilters();
    const leastEfficientByAction = shotDataStore.getLeastEfficientByAction()
    const actionsToInclude = new Set<string>()
    const areasToInclude = new Set<string>()

    leastEfficientByAction.forEach(actionData => {
        actionsToInclude.add(actionData.action)
        actionData.areas.forEach(area => {
            areasToInclude.add(area.name)
        })
    })

    actionsToInclude.forEach(action => graphFiltersStore.setFilter('Offensive Action', action))
    areasToInclude.forEach(area => graphFiltersStore.setFilter('Area', area))
}