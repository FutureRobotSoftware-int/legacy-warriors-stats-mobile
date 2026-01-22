import { parseCSV } from "../utils/csvService";
import { formatToSlug } from "../utils/formatter";
import type { IPlayer } from "../../types/player";
import { usePlayers } from "../stores/players";
import { useShotData } from "../stores/shotData";
import { usePeriod } from "../stores/year";
import { normalizeShotEntry } from "../utils/normalizers";

interface PlayerIndexRow {
  player: string;
  slug: string;
  season: string;
  number?: string;
}

const PLAYERS_INDEX_URL = "/players.csv";

const GCS_BASE_URL = ""

export function buildShotDataPath(
  playerSlug: string,
  period?: string | null
): string {
  return `${GCS_BASE_URL}/players/${playerSlug}/${period}/shotdata.csv`
}

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

  let internalId = 1

  // 3. Load and merge all shotdata CSVs
  for (const row of playerRows) {
    console.group(`→ Period ${row.season}`)

    const shotdataPath = buildShotDataPath(playerSlug, row.season)

    console.log("Loading CSV from:", shotdataPath)

    try {
      const parsedData = await parseCSV(shotdataPath) as any[]

      if (!parsedData.length) {
        console.warn("CSV is empty:", shotdataPath)
        console.groupEnd()
        continue
      }

      const entries = parsedData.map((raw, index) =>
        normalizeShotEntry(raw, index + 1, internalId++)
      )

      shotStore.addData(entries)
      console.log("Entries added:", entries.length)

    } catch (err) {
      console.error("Failed to load CSV:", shotdataPath, err)
    }

    console.groupEnd()
  }


  console.log("Total entries in store:", shotStore.entries.length);
  console.groupEnd();
}
