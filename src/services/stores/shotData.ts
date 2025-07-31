import { defineStore } from "pinia";
import type { IShotData } from "../../types/shotData";
import { useGraphFilters } from "./graphFilters";

export const useShotData = defineStore('shotData', {
    state: (): { entries: IShotData[]; nextId: number } => ({
        entries: [],
        nextId: 1,
    }),
    getters: {
        getAll(state) {
            return state.entries;
        },
        getMake(state) {
            return state.entries.filter((entry) => entry["Make/Miss"].trim() === "Make")
        },
        getByMakeMiss: (state) => (value: string) =>
            state.entries.filter(entry => entry["Make/Miss"].trim() === value),
        getActiveEntries(state): IShotData[] {
            const graphFilters = useGraphFilters();

            return state.entries.filter(entry => {
                const filters = graphFilters.selectedFilters;
                const hidden = graphFilters.hiddenCategories;

                for (const [key, valueSet] of Object.entries(filters)) {
                    const val = String(entry[key as keyof IShotData]);
                    if (!valueSet.has(val)) return false;
                }

                for (const [field, hiddenSet] of Object.entries(hidden)) {
                    if (hiddenSet.has(String(entry[field as keyof IShotData]))) return false;
                }

                return true;
            });
        },
        getActiveIds(state): number[] {
            const graphFilters = useGraphFilters();

            const activeEntries = state.entries.filter(entry => {
                const filters = graphFilters.selectedFilters;
                const hidden = graphFilters.hiddenCategories;

                for (const [key, valueSet] of Object.entries(filters)) {
                    const val = String(entry[key as keyof IShotData]);
                    if (!valueSet.has(val)) return false;
                }

                for (const [field, hiddenSet] of Object.entries(hidden)) {
                    const val = String(entry[field as keyof IShotData]);
                    if (hiddenSet.has(val)) return false;
                }

                return true;
            });

            return activeEntries.map(entry => entry.id);
        }

    },
    actions: {
        clearData() {
            this.entries = [];
            this.nextId = 1;
        },

        addData(newEntry: Omit<IShotData, 'id'>[]) {
            const ids = newEntry.map((p) => {
                const id = this.nextId++;
                this.entries.push({ id, ...p });
                return id;
            });
            console.log("Charged data:", ids.length);
            return ids;
        },

        getColumnValues<T extends keyof IShotData>(col: T): IShotData[T][] {
            return this.entries.map(entry => entry[col]).filter(val => val !== undefined && val !== null && val !== "") as IShotData[T][];
        },

        getUniqueColumnValues<T extends keyof IShotData>(col: T): IShotData[T][] {
            const values = this.getColumnValues(col);
            return [...new Set(values)];
        },

        getMostCommonColumnValue<T extends keyof IShotData>(
            this: { entries: IShotData[] },
            col: T,
            dataset?: IShotData[]
        ): IShotData[T] | null {
            const data = dataset ?? this.entries;
            const values = data.map(entry => entry[col]);
            const countMap: Record<string, number> = {};

            for (const val of values) {
                const key = String(val);
                countMap[key] = (countMap[key] || 0) + 1;
            }

            let mostCommon: string | null = null;
            let maxCount = 0;

            for (const [key, count] of Object.entries(countMap)) {
                if (count > maxCount) {
                    mostCommon = key;
                    maxCount = count;
                }
            }

            if (mostCommon === null) return null;

            const sample = values.find(v => String(v) === mostCommon);
            return sample ?? null;
        },

        getLeastEffectiveColumnValue<T extends keyof IShotData>(
            this: { entries: IShotData[] },
            col: T,
            dataset?: IShotData[]
        ): IShotData[T] | null {
            const data = dataset ?? this.entries;
            if (data.length === 0) return null;

            const grouped = new Map<string, { makes: number; total: number; sample: IShotData[T] }>();

            for (const entry of data) {
                const key = String(entry[col]);
                const result = String(entry["Make/Miss"]).trim();
                const sample = entry[col];

                if (!grouped.has(key)) {
                    grouped.set(key, { makes: 0, total: 0, sample });
                }

                const group = grouped.get(key)!;
                group.total += 1;
                if (result === "Make") {
                    group.makes += 1;
                }
            }

            let minFG = Infinity;
            let leastEffective: IShotData[T] | null = null;

            for (const { makes, total, sample } of grouped.values()) {
                const fg = total > 0 ? makes / total : 0;
                if (fg < minFG) {
                    minFG = fg;
                    leastEffective = sample;
                }
            }

            return leastEffective;
        },


        calcFG(this: { entries: IShotData[] }, dataset?: IShotData[]): string {
            const data = dataset ?? this.entries;

            let total = 0;
            let makes = 0;

            data.forEach(entry => {
                const result = String(entry["Make/Miss"]).trim();
                if (result === "Make" || result === "Miss") {
                    total += 1;
                    if (result === "Make") {
                        makes += 1;
                    }
                }
            });

            const fg = total > 0 ? Math.round((makes / total) * 100) : 0;
            return fg.toFixed();
        },

        calcPPP(this: { entries: IShotData[] }, dataset?: IShotData[]): string {
            const data = dataset ?? this.entries;

            const points = data.map(entry => Number(entry["PTS"])).filter(p => !isNaN(p));
            const total = points.length;

            if (total === 0) {
                return "0.0";
            }

            const sum = points.reduce((a, b) => a + b, 0);
            const result = sum / total;

            return result.toFixed(2);
        },

        calcTotalPoints(this: { entries: IShotData[] }, dataset?: IShotData[]): string {
            const data = dataset ?? this.entries;

            const points = data.map(entry => Number(entry["PTS"])).filter(p => !isNaN(p));
            const total = points.length;

            if (total === 0) {
                return "0.0";
            }

            const sum = points.reduce((a, b) => a + b, 0);

            return sum.toString();
        },


        getGroupedData<T extends keyof IShotData>(
            col: T,
            dataset?: IShotData[]
        ): { value: number; name: string }[] {
            const data = dataset ?? this.entries;

            const values = data
                .map(entry => entry[col])
                .filter(val => val !== undefined && val !== null && val !== '') as IShotData[T][];

            const countMap: Record<string, number> = {};

            for (const val of values) {
                const key = String(val);
                countMap[key] = (countMap[key] || 0) + 1;
            }

            return Object.entries(countMap).map(([name, value]) => ({
                name,
                value,
            }));
        },

        getFGByColumn<T extends keyof IShotData>(col: T, dataset?: IShotData[]): { name: string; value: number }[] {
            const grouped: Record<string, { makes: number; total: number }> = {};
            const data = dataset ?? this.entries;
            data.forEach(entry => {
                const key = String(entry[col]);
                const result = String(entry["Make/Miss"]).trim();

                if (!key) return;

                if (!grouped[key]) {
                    grouped[key] = { makes: 0, total: 0 };
                }

                grouped[key].total += 1;
                if (result === "Make") {
                    grouped[key].makes += 1;
                }
            });

            return Object.entries(grouped).map(([name, { makes, total }]) => {
                const fg = total > 0 ? Math.round((makes / total) * 100) : 0;
                return { name, value: fg };
            });
        },

        getStackedPPPAndFrequencyByActionArea(this: { entries: IShotData[] }, dataset?: IShotData[]) {
            const data = dataset ?? this.entries;

            const dataMap = new Map<
                string, // action
                Map<string, { totalPTS: number; count: number }>
            >();

            const actionsSet = new Set<string>();
            const areasSet = new Set<string>();

            data.forEach(entry => {
                const action = entry['Offensive Action'];
                const area = entry.Area;
                const pts = Number(entry.PTS);

                if (!action || !area || isNaN(pts)) return;

                actionsSet.add(action);
                areasSet.add(area);

                if (!dataMap.has(action)) {
                    dataMap.set(action, new Map());
                }

                const areaMap = dataMap.get(action)!;

                if (!areaMap.has(area)) {
                    areaMap.set(area, { totalPTS: 0, count: 0 });
                }

                const record = areaMap.get(area)!;
                record.totalPTS += pts;
                record.count += 1;
            });

            const actions = Array.from(actionsSet).sort();
            const areas = Array.from(areasSet).sort();

            const barSeries = areas.map(area => ({
                name: area,
                type: 'bar',
                stack: 'total',
                emphasis: { focus: 'series' },
                data: actions.map(action => {
                    const stat = dataMap.get(action)?.get(area);
                    return stat
                        ? {
                            value: stat.count,
                            ppp: Number((stat.totalPTS / stat.count).toFixed(2)),
                        }
                        : {
                            value: 0,
                            ppp: 0,
                        };
                }),
            }));

            const lineSeries = {
                name: 'PPP',
                type: 'line',
                yAxisIndex: 1,
                data: actions.map(action => {
                    const areaMap = dataMap.get(action);
                    if (!areaMap) return 0;

                    let totalPTS = 0;
                    let totalCount = 0;

                    areaMap.forEach(({ totalPTS: pts, count }) => {
                        totalPTS += pts;
                        totalCount += count;
                    });

                    return totalCount > 0 ? Number((totalPTS / totalCount).toFixed(2)) : 0;
                }),
                itemStyle: { color: '#2196F3' },
                lineStyle: { width: 2, type: 'dashed' },
                symbolSize: 6,
            };

            return {
                actions,
                series: [...barSeries, lineSeries],
            };
        },


        getFilteredEntries(
            filters: Record<string, Set<string>>,
            hidden: Record<string, Set<string>>,
            ignoredField: string | null = null,
            ignoreSelf: boolean = true
        ) {
            return this.entries.filter(entry => {
                for (const [key, valueSet] of Object.entries(filters)) {
                    if (ignoreSelf && key === ignoredField) continue;
                    const val = String(entry[key as keyof IShotData]);
                    if (!valueSet.has(val)) return false;
                }

                for (const [field, hiddenSet] of Object.entries(hidden)) {
                    const val = String(entry[field as keyof IShotData]);
                    if (hiddenSet.has(val)) return false;
                }

                return true;
            });
        },

        getInefficiencyByColumn<T extends keyof IShotData>(
            col: T,
            dataset?: IShotData[]
        ): { name: string; value: number }[] {
            const grouped: Record<string, { misses: number; total: number }> = {};
            const data = dataset ?? this.entries;

            data.forEach(entry => {
                const key = String(entry[col]);
                const result = String(entry["Make/Miss"]).trim();

                if (!key) return;

                if (!grouped[key]) {
                    grouped[key] = { misses: 0, total: 0 };
                }

                grouped[key].total += 1;
                if (result === "Miss") {
                    grouped[key].misses += 1;
                }
            });

            return Object.entries(grouped).map(([name, { misses, total }]) => {
                const inefficiency = total > 0 ? Math.round((misses / total) * 100) : 0;
                return { name, value: inefficiency };
            });
        },
        getMostCommonFilters() {
            const commonFilters: Record<string, string> = {};

            // Obtener los valores más comunes para 5 parámetros clave
            const params = [
                'Area',
                'Offensive Action',
                'Player Direction',
                'Pass Direction',
                'Hop/1-2',
            ];

            params.forEach(param => {
                const mostCommon = this.getMostCommonColumnValue(param as keyof IShotData);
                if (mostCommon) {
                    commonFilters[param] = String(mostCommon);
                }
            });

            return commonFilters;
        },
        getMostCommonCombination(): Record<string, string> {
            const params: (keyof IShotData)[] = [
                'Area',
                'Offensive Action',
                'Player Direction',
                'Pass Direction',
                'Hop/1-2'
            ];

            // Crear un mapa para contar las combinaciones
            const combinationCounts = new Map<string, { count: number, values: Record<string, string> }>();

            this.entries.forEach(entry => {
                // Crear una clave única para esta combinación
                const key = params.map(param => String(entry[param] || '')).join('|');

                // Obtener los valores individuales para esta combinación
                const values = params.reduce((acc, param) => {
                    acc[param] = String(entry[param] || '');
                    return acc;
                }, {} as Record<string, string>);

                if (combinationCounts.has(key)) {
                    combinationCounts.get(key)!.count += 1;
                } else {
                    combinationCounts.set(key, { count: 1, values });
                }
            });

            // Encontrar la combinación más común
            let maxCount = 0;
            let mostCommonCombination: Record<string, string> = {};

            combinationCounts.forEach(({ count, values }) => {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommonCombination = values;
                }
            });

            return mostCommonCombination;
        },

        getTopPlaysByArea(areaLimit: number = 2, actionLimit: number = 2) {
            // Primero obtener las áreas más comunes
            const topAreas = this.getGroupedData('Area')
                .sort((a, b) => b.value - a.value)
                .slice(0, areaLimit);

            // Luego obtener las acciones más comunes por área
            const results: Array<{
                area: string;
                actions: Array<{ name: string; value: number }>
            }> = [];

            topAreas.forEach(area => {
                const areaData = this.entries.filter(entry => entry.Area === area.name);
                const topActions = this.getGroupedDataForDataset('Offensive Action', areaData)
                    .sort((a, b) => b.value - a.value)
                    .slice(0, actionLimit);

                results.push({
                    area: area.name,
                    actions: topActions
                });
            });

            return results;
        },

        getLeastEfficientByAction(actionLimit: number = 3, areaLimit: number = 2) {
            // Primero obtener las acciones ofensivas menos eficientes globalmente
            const actionFG = this.getFGByColumn('Offensive Action');
            const leastEfficientActions = [...actionFG]
                .sort((a, b) => a.value - b.value)
                .slice(0, actionLimit);

            // Luego obtener las áreas menos eficientes para cada acción
            const results: Array<{
                action: string;
                areas: Array<{ name: string; value: number }>
            }> = [];

            leastEfficientActions.forEach(action => {
                const actionData = this.entries.filter(entry => entry['Offensive Action'] === action.name);
                const leastEfficientAreas = this.getFGByColumnForDataset('Area', actionData)
                    .sort((a, b) => a.value - b.value)
                    .slice(0, areaLimit);

                results.push({
                    action: action.name,
                    areas: leastEfficientAreas
                });
            });

            return results;
        },

        // Helper methods
        getGroupedDataForDataset<T extends keyof IShotData>(
            col: T,
            dataset: IShotData[]
        ): { value: number; name: string }[] {
            const values = dataset
                .map(entry => entry[col])
                .filter(val => val !== undefined && val !== null && val !== '') as IShotData[T][];

            const countMap: Record<string, number> = {};

            for (const val of values) {
                const key = String(val);
                countMap[key] = (countMap[key] || 0) + 1;
            }

            return Object.entries(countMap).map(([name, value]) => ({
                name,
                value,
            }));
        },

        getFGByColumnForDataset<T extends keyof IShotData>(
            col: T,
            dataset: IShotData[]
        ): { name: string; value: number }[] {
            const grouped: Record<string, { makes: number; total: number }> = {};

            dataset.forEach(entry => {
                const key = String(entry[col]);
                const result = String(entry["Make/Miss"]).trim();

                if (!key) return;

                if (!grouped[key]) {
                    grouped[key] = { makes: 0, total: 0 };
                }

                grouped[key].total += 1;
                if (result === "Make") {
                    grouped[key].makes += 1;
                }
            });

            return Object.entries(grouped).map(([name, { makes, total }]) => {
                const fg = total > 0 ? Math.round((makes / total) * 100) : 0;
                return { name, value: fg };
            });
        }
    }
})