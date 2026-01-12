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

  console.group(`[ShotData] Loading data for player: ${player}`);
  console.log("Slug:", playerSlug);

  // 1. Load index
  const index = await parseCSV(PLAYERS_INDEX_URL) as PlayerIndexRow[];
  console.log("Index rows loaded:", index.length);
  console.table(index.slice(0, 5));

  // 2. Filter rows for selected player
  const playerRows = index.filter(
    (row) => row.slug === playerSlug
  );

  console.log("Matching rows for player:", playerRows.length);
  console.table(playerRows);

  const shotStore = useShotData();
  shotStore.clearData();
  console.log("Shot store cleared");

  // 3. Load and merge all shotdata CSVs
  for (const row of playerRows) {
    console.group(`→ Period ${row.period}`);

    if (!row.shotdata_path) {
      console.warn("Missing shotdata_path", row);
      console.groupEnd();
      continue;
    }

    console.log("Loading CSV from:", row.shotdata_path);

    try {
      const parsedData = await parseCSV(row.shotdata_path) as any[];
      console.log("CSV rows loaded:", parsedData.length);

      if (!parsedData.length) {
        console.warn("CSV is empty:", row.shotdata_path);
        console.groupEnd();
        continue;
      }

      const entries: Omit<IShotData, "id">[] = parsedData.map((raw) =>
        normalizeShotEntry(raw)
      );

      console.log("Normalized entries:", entries.length);
      console.table(entries.slice(0, 3));

      shotStore.addData(entries);
      console.log("Entries added to store");

    } catch (err) {
      console.error("Failed to load CSV:", row.shotdata_path, err);
    }

    console.groupEnd();
  }

  console.log("Total entries in store:", shotStore.entries.length);
  console.groupEnd();
}
