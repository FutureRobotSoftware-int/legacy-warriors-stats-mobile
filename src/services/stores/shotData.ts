import { defineStore } from "pinia";
import type { IShotData } from "../../types/shotData";
import { useGraphFilters } from "./graphFilters";

// Helper type for filter functions
type FilterPredicate = (entry: IShotData) => boolean;

export const useShotData = defineStore('shotData', {
    state: (): { entries: IShotData[]; nextId: number } => ({
        entries: [],
        nextId: 1,
    }),
    getters: {
        getAll: (state) => state.entries,
        getMake: (state) => state.entries.filter(entry => entry["Make/Miss"].trim() === "Make"),
        getByMakeMiss: (state) => (value: string) =>
            state.entries.filter(entry => entry["Make/Miss"].trim() === value),

        // Reusable filter function to avoid code duplication
        _activeEntriesFilter(): FilterPredicate {
            const graphFilters = useGraphFilters();
            return (entry: IShotData) => {
                const { selectedFilters, hiddenCategories } = graphFilters;

                // Check selected filters
                for (const [key, valueSet] of Object.entries(selectedFilters)) {
                    const val = String(entry[key as keyof IShotData]);
                    if (!valueSet.has(val)) return false;
                }

                // Check hidden categories
                for (const [field, hiddenSet] of Object.entries(hiddenCategories)) {
                    if (hiddenSet.has(String(entry[field as keyof IShotData]))) return false;
                }

                return true;
            };
        },

        getActiveEntries(state): IShotData[] {
            return state.entries.filter(this._activeEntriesFilter);
        },

        getActiveIds(state): number[] {
            return state.entries.filter(this._activeEntriesFilter).map(entry => entry.id);
        }
    },
    actions: {
        getById(id: number) {
            // Fixed assignment operator (=) to comparison (===)
            return this.entries.find(entry => entry.id === id);
        },

        clearData() {
            this.entries = [];
            this.nextId = 1;
        },

        addData(newEntries: Omit<IShotData, 'id'>[]) {
            const ids = newEntries.map(entry => {
                const id = this.nextId++;
                this.entries.push({ id, ...entry });
                return id;
            });
            console.log("Charged data:", ids.length);
            return ids;
        },

        // Column value helpers
        getColumnValues<T extends keyof IShotData>(col: T): IShotData[T][] {
            return this.entries
                .map(entry => entry[col])
                .filter(val => val != null && val !== "") as IShotData[T][];
        },

        getUniqueColumnValues<T extends keyof IShotData>(col: T): IShotData[T][] {
            return [...new Set(this.getColumnValues(col))];
        },

        // Common value calculation
        _calculateCommonValue<T extends keyof IShotData>(
            col: T,
            dataset: IShotData[],
            compareFn: (a: [string, number], b: [string, number]) => number
        ): IShotData[T] | null {
            const data = dataset ?? this.entries;
            const countMap = new Map<string, number>();

            for (const entry of data) {
                const key = String(entry[col]);
                countMap.set(key, (countMap.get(key) || 0) + 1);
            }

            if (countMap.size === 0) return null;

            const sorted = [...countMap.entries()].sort(compareFn);
            const sample = data.find(entry => String(entry[col]) === sorted[0][0]);
            return sample?.[col] ?? null;
        },

        getMostCommonColumnValue<T extends keyof IShotData>(
            col: T,
            dataset?: IShotData[]
        ): IShotData[T] | null {
            return this._calculateCommonValue(
                col,
                dataset ?? this.entries,
                (a, b) => b[1] - a[1] // Descending sort
            );
        },

        getLeastCommonColumnValue<T extends keyof IShotData>(
            col: T,
            dataset?: IShotData[]
        ): IShotData[T] | null {
            return this._calculateCommonValue(
                col,
                dataset ?? this.entries,
                (a, b) => a[1] - b[1] // Ascending sort
            );
        },

        // Efficiency calculations
        _calculateEfficiency<T extends keyof IShotData>(
            col: T,
            dataset: IShotData[],
            efficiencyFn: (makes: number, total: number) => number
        ): { name: string; value: number }[] {
            const data = dataset ?? this.entries;
            const grouped = new Map<string, { makes: number; total: number }>();

            for (const entry of data) {
                const key = String(entry[col]);
                const result = String(entry["Make/Miss"]).trim();

                if (!key) continue;

                if (!grouped.has(key)) {
                    grouped.set(key, { makes: 0, total: 0 });
                }

                const group = grouped.get(key)!;
                group.total += 1;
                if (result === "Make") group.makes += 1;
            }

            return [...grouped.entries()].map(([name, { makes, total }]) => ({
                name,
                value: efficiencyFn(makes, total)
            }));
        },

        getFGByColumn<T extends keyof IShotData>(
            col: T,
            dataset?: IShotData[]
        ): { name: string; value: number }[] {
            return this._calculateEfficiency(
                col,
                dataset ?? this.entries,
                (makes, total) => total > 0 ? Math.round((makes / total) * 100) : 0
            );
        },

        getInefficiencyByColumn<T extends keyof IShotData>(
            col: T,
            dataset?: IShotData[]
        ): { name: string; value: number }[] {
            return this._calculateEfficiency(
                col,
                dataset ?? this.entries,
                (makes, total) => total > 0 ? Math.round(((total - makes) / total) * 100) : 0
            );
        },

        getLeastEffectiveColumnValue<T extends keyof IShotData>(
            col: T,
            dataset?: IShotData[]
        ): IShotData[T] | null {
            const data = dataset ?? this.entries;
            if (data.length === 0) return null;

            const efficiency = this.getFGByColumn(col, data);
            if (efficiency.length === 0) return null;

            const leastEffective = efficiency.reduce((min, curr) =>
                curr.value < min.value ? curr : min
            );

            const sample = data.find(entry =>
                String(entry[col]) === leastEffective.name
            );

            return sample?.[col] ?? null;
        },

        // Statistical calculations
        calcFG(dataset?: IShotData[]): string {
            const data = dataset ?? this.entries;
            let makes = 0;
            let total = 0;

            for (const entry of data) {
                const result = String(entry["Make/Miss"]).trim();
                if (result === "Make" || result === "Miss") {
                    total += 1;
                    if (result === "Make") makes += 1;
                }
            }

            return total > 0 ? Math.round((makes / total) * 100).toString() : "0";
        },

        calcPPP(dataset?: IShotData[]): string {
            const data = dataset ?? this.entries;
            const points = data
                .map(entry => Number(entry["PTS"]))
                .filter(p => !isNaN(p));

            if (points.length === 0) return "0.00";

            const sum = points.reduce((a, b) => a + b, 0);
            return (sum / points.length).toFixed(2);
        },

        calcTotalPoints(dataset?: IShotData[]): string {
            const data = dataset ?? this.entries;
            const sum = data
                .map(entry => Number(entry["PTS"]))
                .filter(p => !isNaN(p))
                .reduce((a, b) => a + b, 0);

            return sum.toString();
        },

        // Grouping and aggregation
        getGroupedData<T extends keyof IShotData>(
            col: T,
            dataset?: IShotData[]
        ): { value: number; name: string }[] {
            const data = dataset ?? this.entries;
            const countMap = new Map<string, number>();

            for (const entry of data) {
                const key = String(entry[col]);
                if (key) {
                    countMap.set(key, (countMap.get(key) || 0) + 1);
                }
            }

            return [...countMap.entries()].map(([name, value]) => ({ name, value }));
        },

        getStackedPPPAndFrequencyByActionArea(dataset?: IShotData[]) {
            const data = dataset ?? this.entries;
            const dataMap = new Map<string, Map<string, { totalPTS: number; count: number }>>();
            const actionsSet = new Set<string>();
            const areasSet = new Set<string>();

            for (const entry of data) {
                const action = entry['Offensive Action'];
                const area = entry.Area;
                const pts = Number(entry.PTS);

                if (!action || !area || isNaN(pts)) continue;

                actionsSet.add(action);
                areasSet.add(area);

                if (!dataMap.has(action)) {
                    dataMap.set(action, new Map());
                }

                const areaMap = dataMap.get(action)!;
                const record = areaMap.get(area) || { totalPTS: 0, count: 0 };
                record.totalPTS += pts;
                record.count += 1;
                areaMap.set(area, record);
            }

            const actions = Array.from(actionsSet).sort();
            const areas = Array.from(areasSet).sort();

            const barSeries = areas.map(area => ({
                name: area,
                type: 'bar',
                stack: 'total',
                emphasis: { focus: 'series' },
                data: actions.map(action => {
                    const stat = dataMap.get(action)?.get(area);
                    return stat ? {
                        value: stat.count,
                        ppp: Number((stat.totalPTS / stat.count).toFixed(2)),
                    } : {
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

        // Filtering
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

        // Analysis helpers
        getMostCommonCombination(): Record<string, string> {
            const params = ['Area', 'Offensive Action', 'Pass Direction'] as const;
            const combinationCounts = new Map<string, { count: number, values: Record<string, string> }>();

            for (const entry of this.entries) {
                const key = params.map(param => String(entry[param] || '')).join('|');
                const values = params.reduce((acc, param) => {
                    acc[param] = String(entry[param] || '');
                    return acc;
                }, {} as Record<string, string>);

                const existing = combinationCounts.get(key);
                combinationCounts.set(key, {
                    count: existing ? existing.count + 1 : 1,
                    values
                });
            }

            let maxCount = 0;
            let mostCommonCombination: Record<string, string> = {};

            for (const { count, values } of combinationCounts.values()) {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommonCombination = values;
                }
            }

            return mostCommonCombination;
        },

        getTopPlaysByArea(areaLimit: number = 2, actionLimit: number = 2) {
            const topAreas = this.getGroupedData('Area')
                .sort((a, b) => b.value - a.value)
                .slice(0, areaLimit);

            return topAreas.map(area => ({
                area: area.name,
                actions: this.getGroupedData('Offensive Action',
                    this.entries.filter(entry => entry.Area === area.name))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, actionLimit)
            }));
        },

        getLeastEfficientByAction(actionLimit: number = 3, areaLimit: number = 2) {
            const actionFG = this.getFGByColumn('Offensive Action')
                .sort((a, b) => a.value - b.value)
                .slice(0, actionLimit);

            return actionFG.map(action => ({
                action: action.name,
                areas: this.getFGByColumn('Area',
                    this.entries.filter(entry => entry['Offensive Action'] === action.name))
                    .sort((a, b) => a.value - b.value)
                    .slice(0, areaLimit)
            }));
        },
        getTopEntriesByFilters(limit: number = 3): Record<string, string[]> {
            // Key parameters we want to get top entries for
            const keyParams = ['Area', 'Offensive Action', 'Pass Direction'];
            const result: Record<string, string[]> = {};

            // Get currently active entries based on filters
            const activeEntries = this.getActiveEntries;

            // For each key parameter, get top entries
            for (const param of keyParams) {
                const grouped = this.getGroupedData(param, activeEntries)
                    .sort((a, b) => b.value - a.value)
                    .slice(0, limit)
                    .map(item => item.name);

                result[param] = grouped;
            }

            return result;
        }
    }
});