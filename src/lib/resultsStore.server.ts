// Server-only module. Persists player results to a JSON file on disk so an
// admin can review every player's progress, not just what's in their own
// browser's localStorage.
//
// NOTE: this relies on Node's filesystem, which works for local dev and any
// standard Node host. If this project is ever deployed to an edge/serverless
// runtime without a writable filesystem (e.g. Cloudflare Workers), swap this
// module's implementation for a KV/D1/Postgres-backed store — the rest of the
// app only talks to the functions exported below, so nothing else changes.
import { promises as fs } from "node:fs";
import path from "node:path";

export interface PlayerResult {
  playerId: string;
  playerName: string;
  level: number;
  xp: number;
  cash: number;
  debt: number;
  netWorth: number;
  portfolioValue: number;
  creditScore: number;
  esgScore: number;
  riskLevel: number;
  totalProfit: number;
  totalLoss: number;
  tradesCount: number;
  bankruptcyCount: number;
  day: number;
  month: number;
  year: number;
  daysPlayed: number;
  companiesCreated: number;
  assetsOwned: number;
  completedMissions: number;
  submittedAt: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "results.json");

// Serialize writes so concurrent submissions can't clobber each other.
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "{}", "utf-8");
  }
}

async function readAll(): Promise<Record<string, PlayerResult>> {
  await ensureFile();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Record<string, PlayerResult>;
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, PlayerResult>): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function upsertResult(result: PlayerResult): Promise<PlayerResult> {
  return enqueue(async () => {
    const all = await readAll();
    all[result.playerId] = result;
    await writeAll(all);
    return result;
  });
}

export async function getAllResults(): Promise<PlayerResult[]> {
  const all = await readAll();
  return Object.values(all).sort((a, b) => b.submittedAt - a.submittedAt);
}

export async function deleteResultById(playerId: string): Promise<void> {
  await enqueue(async () => {
    const all = await readAll();
    delete all[playerId];
    await writeAll(all);
  });
}
