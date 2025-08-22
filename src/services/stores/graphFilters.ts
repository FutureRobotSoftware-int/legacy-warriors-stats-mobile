import { defineStore } from 'pinia'

export const useGraphFilters = defineStore('graphFilters', {
    state: () => ({
        selectedFilters: {} as Record<string, Set<string>>,
        hiddenCategories: {} as Record<string, Set<string>>,
        activeSource: null as string | null,
        mode: 'general' as 'general' | 'most-common' | 'least-efficient' | 'custom',
        topItems: {} as Record<string, string[]>,
    }),

    getters: {
        getMode: (state) => state.mode,
    },

    actions: {
        setTopItems(items: Record<string, string[]>) {
            this.topItems = items;
        },

        getTopItems(field: string): string[] {
            return this.topItems[field] || [];
        },

        setMode(newMode: 'general' | 'most-common' | 'least-efficient' | 'custom') {
            this.mode = newMode;
            console.log('Current Mode', this.mode)
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
            // Create the Set if it doesn't exist
            if (!this.hiddenCategories[field]) {
                this.hiddenCategories[field] = new Set();
            }

            const fieldSet = this.hiddenCategories[field];

            // Toggle the category
            if (fieldSet.has(category)) {
                fieldSet.delete(category);
            } else {
                fieldSet.add(category);
            }

            // Clean up empty sets
            if (fieldSet.size === 0) {
                delete this.hiddenCategories[field];
            }

            // Only log in development
            // if (process.env.NODE_ENV === 'development') {
            console.log('Hidden categories:', Object.fromEntries(
                Object.entries(this.hiddenCategories).map(([k, v]) => [k, [...v]])
            ));
            // }
        },

        clearAll() {
            this.selectedFilters = {}
            this.hiddenCategories = {}
            this.activeSource = null
        },
        clearAllGeneral() {
            this.selectedFilters = {}
            this.hiddenCategories = {}
            this.activeSource = null
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
            this.setFilter(field, value);
        },

        clearHiddenCategories() {
            this.hiddenCategories = {};
        },
    }
})
