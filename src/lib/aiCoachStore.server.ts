// Server-only module. Persists AI recommendations (chat replies AND
// proactive nudges) and the decisions players make afterwards, so an
// admin/researcher can correlate advice given with actions taken.
//
// IMPORTANT: this used to write to local JSON files on disk. That does NOT
// work on Vercel (and most serverless hosts): the filesystem there is
// read-only in production and/or wiped between invocations, so nothing ever
// persisted. This version stores everything in Supabase, same as
// resultsStore.server.ts, so data survives across requests/deploys.
import { supabaseAdmin } from "./supabaseAdmin.server";

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
  playerName: string;
  timestamp: number;
  action: "buy" | "sell";
  stockSymbol: string;
  shares: number;
  price: number;
}

type AiRecommendationRow = {
  id: string;
  player_id: string;
  player_name: string;
  timestamp: number;
  user_message: string;
  ai_reply: string;
  related_stock_symbols: string[];
  kind: "chat" | "nudge" | null;
  trigger_type: NudgeTrigger | null;
};

type PlayerDecisionRow = {
  id: string;
  player_id: string;
  player_name: string;
  timestamp: number;
  action: "buy" | "sell";
  stock_symbol: string;
  shares: number;
  price: number;
};

function recToRow(rec: AiRecommendation): AiRecommendationRow {
  return {
    id: rec.id,
    player_id: rec.playerId,
    player_name: rec.playerName,
    timestamp: rec.timestamp,
    user_message: rec.userMessage,
    ai_reply: rec.aiReply,
    related_stock_symbols: rec.relatedStockSymbols,
    kind: rec.kind ?? "chat",
    trigger_type: rec.triggerType ?? null,
  };
}

function rowToRec(row: AiRecommendationRow): AiRecommendation {
  return {
    id: row.id,
    playerId: row.player_id,
    playerName: row.player_name,
    timestamp: row.timestamp,
    userMessage: row.user_message,
    aiReply: row.ai_reply,
    relatedStockSymbols: row.related_stock_symbols ?? [],
    kind: row.kind ?? "chat",
    triggerType: row.trigger_type ?? undefined,
  };
}

function decisionToRow(decision: PlayerDecision): PlayerDecisionRow {
  return {
    id: decision.id,
    player_id: decision.playerId,
    player_name: decision.playerName,
    timestamp: decision.timestamp,
    action: decision.action,
    stock_symbol: decision.stockSymbol,
    shares: decision.shares,
    price: decision.price,
  };
}

function rowToDecision(row: PlayerDecisionRow): PlayerDecision {
  return {
    id: row.id,
    playerId: row.player_id,
    playerName: row.player_name,
    timestamp: row.timestamp,
    action: row.action,
    stockSymbol: row.stock_symbol,
    shares: row.shares,
    price: row.price,
  };
}

export async function addRecommendation(rec: AiRecommendation): Promise<void> {
  const { error } = await supabaseAdmin.from("ai_recommendations").insert(recToRow(rec));
  if (error) {
    throw new Error(`Supabase addRecommendation failed: ${error.message}`);
  }
}

export async function addDecision(decision: PlayerDecision): Promise<void> {
  const { error } = await supabaseAdmin.from("ai_decisions").insert(decisionToRow(decision));
  if (error) {
    throw new Error(`Supabase addDecision failed: ${error.message}`);
  }
}

export async function getAllRecommendations(): Promise<AiRecommendation[]> {
  const { data, error } = await supabaseAdmin
    .from("ai_recommendations")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    throw new Error(`Supabase getAllRecommendations failed: ${error.message}`);
  }

  return (data ?? []).map((row) => rowToRec(row as AiRecommendationRow));
}

export async function getAllDecisions(): Promise<PlayerDecision[]> {
  const { data, error } = await supabaseAdmin
    .from("ai_decisions")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    throw new Error(`Supabase getAllDecisions failed: ${error.message}`);
  }

  return (data ?? []).map((row) => rowToDecision(row as PlayerDecisionRow));
}

export async function deleteRecommendation(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("ai_recommendations").delete().eq("id", id);
  if (error) {
    throw new Error(`Supabase deleteRecommendation failed: ${error.message}`);
  }
}

export async function deleteDecision(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("ai_decisions").delete().eq("id", id);
  if (error) {
    throw new Error(`Supabase deleteDecision failed: ${error.message}`);
  }
}

export async function deleteRecommendationsByPlayer(playerId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("ai_recommendations")
    .delete()
    .eq("player_id", playerId);
  if (error) {
    throw new Error(`Supabase deleteRecommendationsByPlayer failed: ${error.message}`);
  }
}

export async function deleteDecisionsByPlayer(playerId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("ai_decisions").delete().eq("player_id", playerId);
  if (error) {
    throw new Error(`Supabase deleteDecisionsByPlayer failed: ${error.message}`);
  }
}
