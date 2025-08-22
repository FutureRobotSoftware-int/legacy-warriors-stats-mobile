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
 * Applies filters for least efficient plays
 */
export const applyLeastEfficientFilters = () => {
    const shotDataStore = useShotData();
    const graphFiltersStore = useGraphFilters();
    const leastEfficientByAction = shotDataStore.getLeastEfficientByAction();

    const actionsToKeep = new Set<string>();
    const areasToKeep = new Set<string>();

    leastEfficientByAction.forEach(actionData => {
        actionsToKeep.add(actionData.action);
        actionData.areas.forEach(area => {
            areasToKeep.add(area.name);
        });
    });

    const allAreas = shotDataStore.getGroupedData("Area").map(a => a.name);
    const allActions = shotDataStore.getGroupedData("Offensive Action").map(a => a.name);

    allActions
        .filter(action => !actionsToKeep.has(action))
        .forEach(action => graphFiltersStore.toggleCategoryVisibility("Offensive Action", action));

    allAreas
        .filter(area => !areasToKeep.has(area))
        .forEach(area => graphFiltersStore.toggleCategoryVisibility("Area", area));
};
