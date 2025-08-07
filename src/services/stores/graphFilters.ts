import { defineStore } from 'pinia'

export const useGraphFilters = defineStore('graphFilters', {
    state: () => ({
        selectedFilters: {} as Record<string, Set<string>>,
        hiddenCategories: {} as Record<string, Set<string>>,
        activeSource: null as string | null,
        mode: 'general' as 'general' | 'most-common' | 'top-plays' | 'least-efficient' | 'custom',
    }),

    actions: {
        setMode(newMode: 'general' | 'most-common' | 'top-plays' | 'least-efficient' | 'custom') {
            this.mode = newMode;
        },
        setFilter(field: string, value: string, isSingleSelect: boolean = false) {
            if (isSingleSelect) {
                this.selectedFilters[field] = new Set([value]);
                this.activeSource = field;
            } else {
                if (!this.selectedFilters[field]) {
                    this.selectedFilters[field] = new Set();
                }

                if (this.selectedFilters[field].has(value)) {
                    this.selectedFilters[field].delete(value);
                    if (this.selectedFilters[field].size === 0) {
                        delete this.selectedFilters[field];
                        if (this.activeSource === field) this.activeSource = null;
                    }
                } else {
                    this.selectedFilters[field].add(value);
                    this.activeSource = field;
                }
            }

            console.log('Filtros actuales:', JSON.stringify(
                Object.fromEntries(
                    Object.entries(this.selectedFilters).map(([k, v]) => [k, Array.from(v)])
                ),
                null, 2
            ));
        },

        toggleCategoryVisibility(field: string, category: string) {
            if (!this.hiddenCategories[field]) {
                this.hiddenCategories[field] = new Set();
            }

            if (this.hiddenCategories[field].has(category)) {
                this.hiddenCategories[field].delete(category);
            } else {
                this.hiddenCategories[field].add(category);
            }

            if (this.hiddenCategories[field].size === 0) {
                delete this.hiddenCategories[field];
            }

            console.log('Categorías ocultas:', JSON.stringify(
                Object.fromEntries(
                    Object.entries(this.hiddenCategories).map(([k, v]) => [k, Array.from(v)])
                ),
                null, 2
            ));
        },

        clearAll() {
            this.selectedFilters = {}
            this.hiddenCategories = {}
            this.activeSource = null
            this.setMode('general')
        },
        clearAllGeneral() {
            this.selectedFilters = {}
            this.hiddenCategories = {}
            this.activeSource = null
            this.setMode('general')
        },
        clearFilter(field: string) {
            if (this.selectedFilters[field]) {
                delete this.selectedFilters[field];
                if (this.activeSource === field) {
                    this.activeSource = null;
                }
            }
        },
        replaceFilter(field: string, value: string) {
            this.clearFilter(field);

            this.selectedFilters[field] = new Set([value]);
            this.activeSource = field;

            console.log('Filtro reemplazado:', field, 'con valor:', value);
        },

        clearHiddenCategories() {
            this.hiddenCategories = {};
        },
    }
})
