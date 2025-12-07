import { parseCSV } from "../utils/csvService";
import { formatToSlug } from "../utils/formatter";
import type { IPlayer } from "../../types/player";
import { usePlayers } from "../stores/players";
import { useShotData } from "../stores/shotData";
import type { IShotData } from "../../types/shotData";
import { usePeriod } from "../stores/year";
import { normalizeShotEntry } from "../utils/normalizers";

const SHOTDATA_BASE_URL = "/shotdata/";

export async function loadPlayers() {
  const parsedData: any = await parseCSV(`${SHOTDATA_BASE_URL}players.csv`);

  const playersStore = usePlayers();
  const players: Omit<IPlayer, "id">[] = parsedData.map(
    (p: { player: String; number: string; folder: string }) => ({
      player: p.player ?? "No name",
      data: p.player ? formatToSlug(p.player) : "",
      number: p.number ?? "",
      folder: p.folder ?? "",
      isSelected: false,
    })
  );

  console.log("[Players loaded from GCS]:", players);

  return playersStore.addPlayers(players);
}

export async function loadFilters() {
  const periodStore = usePeriod();
  return periodStore.addPeriods();
}

export async function loadShotData(player: string) {
  const playerSlug = formatToSlug(player);

  const url = `${SHOTDATA_BASE_URL}${playerSlug}-Shotdata.csv`;

  const parsedData: any = await parseCSV(url);

  const shotStore = useShotData();

  const entries: Omit<IShotData, "id">[] = parsedData.map((row: any) =>
    normalizeShotEntry(row)
  );

  shotStore.clearData();

  return shotStore.addData(entries);
}
