// Server-only module. Persists AI recommendations (chat replies AND
// proactive nudges) and the decisions players make afterwards, so an
// admin/researcher can correlate advice given with actions taken. Same
// JSON-on-disk pattern as resultsStore.server.ts — swap this implementation
// for a real DB if you move off a Node filesystem host.
import { promises as fs } from "node:fs";
import path from "node:path";

export type NudgeTrigger = "post_trade" | "concentration" | "news_impact" | "loss_streak";

export interface AiRecommendation {
  id: string;
  playerId: string;
  playerName: string;
  timestamp: number;
  userMessage: string;
  aiReply: string;
  relatedStockSymbols: string[];
  // Older entries (before nudges existed) won't have these — treat missing
  // kind as "chat" wherever this is read.
  kind?: "chat" | "nudge";
  triggerType?: NudgeTrigger;
}

export interface PlayerDecision {
  id: string;
  playerId: string;
  timestamp: number;
  action: "buy" | "sell";
  stockSymbol: string;
  shares: number;
  price: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const RECS_FILE = path.join(DATA_DIR, "ai-recommendations.json");
const DECISIONS_FILE = path.join(DATA_DIR, "ai-decisions.json");

let writeQueue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function ensureFile(file: string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, "[]", "utf-8");
  }
}

async function readArray<T>(file: string): Promise<T[]> {
  await ensureFile(file);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeArray<T>(file: string, data: T[]): Promise<void> {
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function addRecommendation(rec: AiRecommendation): Promise<void> {
  await enqueue(async () => {
    const all = await readArray<AiRecommendation>(RECS_FILE);
    all.push(rec);
    await writeArray(RECS_FILE, all);
  });
}

export async function addDecision(decision: PlayerDecision): Promise<void> {
  await enqueue(async () => {
    const all = await readArray<PlayerDecision>(DECISIONS_FILE);
    all.push(decision);
    await writeArray(DECISIONS_FILE, all);
  });
}

export async function getAllRecommendations(): Promise<AiRecommendation[]> {
  const all = await readArray<AiRecommendation>(RECS_FILE);
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

export async function getAllDecisions(): Promise<PlayerDecision[]> {
  const all = await readArray<PlayerDecision>(DECISIONS_FILE);
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteRecommendation(id: string): Promise<void> {
  await enqueue(async () => {
    const all = await readArray<AiRecommendation>(RECS_FILE);
    const filtered = all.filter((r) => r.id !== id);
    await writeArray(RECS_FILE, filtered);
  });
}

export async function deleteDecision(id: string): Promise<void> {
  await enqueue(async () => {
    const all = await readArray<PlayerDecision>(DECISIONS_FILE);
    const filtered = all.filter((d) => d.id !== id);
    await writeArray(DECISIONS_FILE, filtered);
  });
}
export async function deleteRecommendationsByPlayer(playerId: string): Promise<void> {
  await enqueue(async () => {
    const all = await readArray<AiRecommendation>(RECS_FILE);
    const filtered = all.filter((r) => r.playerId !== playerId);
    await writeArray(RECS_FILE, filtered);
  });
}

export async function deleteDecisionsByPlayer(playerId: string): Promise<void> {
  await enqueue(async () => {
    const all = await readArray<PlayerDecision>(DECISIONS_FILE);
    const filtered = all.filter((d) => d.playerId !== playerId);
    await writeArray(DECISIONS_FILE, filtered);
  });
}