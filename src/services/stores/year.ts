import { defineStore } from "pinia";
import { useShotData } from "./shotData";
import { useGraphFilters } from "./graphFilters";
import type { IPeriod } from "../../types/period";

export const usePeriod = defineStore('period', {
    state: () => ({
        periods: [] as IPeriod[],
        nextId: 0,
    }),

    getters: {
        selectedPeriod(state): IPeriod | null {
            return state.periods.find(p => p.isSelected) || null;
        },
        allPeriods(state): IPeriod[] {
            return state.periods;
        },
        allTimePeriod(state): IPeriod | undefined {
            return state.periods.find(p => p.period === "All time");
        }
    },

    actions: {
        addPeriods() {
            const shotDataStore = useShotData();
            const uniquePeriods = shotDataStore.getUniqueColumnValues("Year");

            this.periods = [{
                id: this.nextId++,
                period: "All time",
                isSelected: true
            }];

            this.periods.push(...uniquePeriods.map(p => ({
                id: this.nextId++,
                period: p,
                isSelected: false
            })));

            // console.log(this.periods);
        },

        refreshPeriods() {
            this.clearPeriods();

            const shotDataStore = useShotData();
            const uniquePeriods = shotDataStore.getUniqueColumnValues("Year");

            this.periods = [{
                id: this.nextId++,
                period: "All time",
                isSelected: true
            }];

            this.periods.push(...uniquePeriods.map(p => ({
                id: this.nextId++,
                period: p,
                isSelected: false
            })));

            // console.log(this.periods);
        },

        clearPeriods() {
            this.periods = [];
            this.nextId = 0;
        },

        selectPeriod(period: IPeriod) {
            const filterStore = useGraphFilters();

            this.periods.forEach(p => {
                p.isSelected = false;
            });

            period.isSelected = true;

            filterStore.clearFilter("Year");

            if (period.period !== "All time") {
                filterStore.replaceFilter("Year", period.period);
            }

            if (period.period !== "All time") {
                filterStore.setFilter("Year", period.period, true);
            }

            // console.log("[Period Selected]:", period);
        },

        selectAllTime() {
            const allTime = this.allTimePeriod;
            if (allTime) {
                this.selectPeriod(allTime);
            }
        }
    }
});