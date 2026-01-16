import { defineStore } from "pinia";
import type { IPlayer } from "../../types/player";
import { loadShotData } from "../data/dataLoader";
import { useGraphFilters } from "./graphFilters";

export const usePlayers = defineStore('players', {
    state: (): { players: IPlayer[]; nextId: number } => ({
        players: [],
        nextId: 0,
    }),
    getters: {
        selectedPlayer(state) {
            return state.players.find(player => player.isSelected) || null;
        },
        allPlayers(state) {
            return state.players;
        }
    },
    actions: {
        addPlayers(newPlayer: Omit<IPlayer, 'id'>[]) {
            newPlayer.forEach(p => {
                this.players.push({
                    id: this.nextId++,
                    ...p
                })
            })
        },
        selectPlayer(player: IPlayer) {
            const alreadySelected = this.players.find(p => p.isSelected && p.id === player.id);
            if (alreadySelected) return;

            this.players.forEach(p => {
                p.isSelected = (p.id === player.id);
            });

            const graphStore = useGraphFilters();

            graphStore.clearAll();

            loadShotData(player.data);

            console.log("[Player Selected:", player);
        }
    }
})