import { parseCSV } from "../utils/csvService";
import { formatToSlug } from "../utils/formatter";
import type { IPlayer } from "../../types/player";
import { usePlayers } from "../stores/players";
import { useShotData } from "../stores/shotData";
import type { IShotData } from "../../types/shotData";
import { usePeriod } from "../stores/year";
import { normalizeShotEntry } from "../utils/normalizers";

interface PlayerIndexRow {
  player: string;
  slug: string;
  period: string;
  shotdata_path: string;
  footage_path?: string;
  number?: string;
} 


const PLAYERS_INDEX_URL = "/players.csv";

/**
 * Load players from index CSV
 * One entry per player (not per period)
 */
export async function loadPlayers() {
  const parsedData = await parseCSV(PLAYERS_INDEX_URL) as PlayerIndexRow[];

  const playersStore = usePlayers();

  const playersMap = new Map<string, Omit<IPlayer, "id">>();

  parsedData.forEach((row) => {
    const slug = row.slug ?? formatToSlug(row.player);

    if (!playersMap.has(slug)) {
      playersMap.set(slug, {
        player: row.player ?? "No name",
        data: slug,
        number: row.number ?? "",
        folder: `players/${slug}`,
        isSelected: false,
      });
    }
  });

  const players = Array.from(playersMap.values());

  console.log("[Players loaded from GCS]:", players);

  return playersStore.addPlayers(players);
}

/**
 * Load available periods (seasons / years)
 * This should stay simple: selector only
 */
export async function loadFilters() {
  const periodStore = usePeriod();
  return periodStore.addPeriods();
}

/**
 * Load ALL shotdata for a player (all periods)
 * Period filtering is handled by the store
 */
export async function loadShotData(player: string) {
  const playerSlug = formatToSlug(player);

  // 1. Load index
  const index = await parseCSV(PLAYERS_INDEX_URL) as PlayerIndexRow[];

  // 2. Filter rows for selected player
  const playerRows = index.filter(
    (row) => row.slug === playerSlug
  );

  const shotStore = useShotData();
  shotStore.clearData();

  // 3. Load and merge all shotdata CSVs
  for (const row of playerRows) {
    if (!row.shotdata_path || !row.period) continue;

    const parsedData = await parseCSV(row.shotdata_path) as any[];

    const entries: Omit<IShotData, "id">[] = parsedData.map((raw) =>
      normalizeShotEntry(raw, row.period)
    );

    shotStore.addData(entries);
  }
}
