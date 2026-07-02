import { supabaseAdmin } from "./supabaseAdmin.server";

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

type PlayerResultRow = {
  player_id: string;
  player_name: string;
  level: number;
  xp: number;
  cash: number;
  debt: number;
  net_worth: number;
  portfolio_value: number;
  credit_score: number;
  esg_score: number;
  risk_level: number;
  total_profit: number;
  total_loss: number;
  trades_count: number;
  bankruptcy_count: number;
  day: number;
  month: number;
  year: number;
  days_played: number;
  companies_created: number;
  assets_owned: number;
  completed_missions: number;
  submitted_at: number;
};

function toRow(result: PlayerResult): PlayerResultRow {
  return {
    player_id: result.playerId,
    player_name: result.playerName,
    level: result.level,
    xp: result.xp,
    cash: result.cash,
    debt: result.debt,
    net_worth: result.netWorth,
    portfolio_value: result.portfolioValue,
    credit_score: result.creditScore,
    esg_score: result.esgScore,
    risk_level: result.riskLevel,
    total_profit: result.totalProfit,
    total_loss: result.totalLoss,
    trades_count: result.tradesCount,
    bankruptcy_count: result.bankruptcyCount,
    day: result.day,
    month: result.month,
    year: result.year,
    days_played: result.daysPlayed,
    companies_created: result.companiesCreated,
    assets_owned: result.assetsOwned,
    completed_missions: result.completedMissions,
    submitted_at: result.submittedAt,
  };
}

function fromRow(row: PlayerResultRow): PlayerResult {
  return {
    playerId: row.player_id,
    playerName: row.player_name,
    level: row.level,
    xp: row.xp,
    cash: row.cash,
    debt: row.debt,
    netWorth: row.net_worth,
    portfolioValue: row.portfolio_value,
    creditScore: row.credit_score,
    esgScore: row.esg_score,
    riskLevel: row.risk_level,
    totalProfit: row.total_profit,
    totalLoss: row.total_loss,
    tradesCount: row.trades_count,
    bankruptcyCount: row.bankruptcy_count,
    day: row.day,
    month: row.month,
    year: row.year,
    daysPlayed: row.days_played,
    companiesCreated: row.companies_created,
    assetsOwned: row.assets_owned,
    completedMissions: row.completed_missions,
    submittedAt: row.submitted_at,
  };
}

export async function upsertResult(result: PlayerResult): Promise<PlayerResult> {
  console.log("upsertResult payload:", result);

  const { error } = await supabaseAdmin
    .from("player_results")
    .upsert(toRow(result), { onConflict: "player_id" });

  if (error) {
    console.error("Supabase upsert error:", error);
    throw new Error(`Supabase upsertResult failed: ${error.message}`);
  }

  return result;
}

export async function getAllResults(): Promise<PlayerResult[]> {
  const { data, error } = await supabaseAdmin
    .from("player_results")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase getAllResults failed: ${error.message}`);
  }

  return (data ?? []).map((row) => fromRow(row as PlayerResultRow));
}

export async function deleteResultById(playerId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("player_results")
    .delete()
    .eq("player_id", playerId);

  if (error) {
    throw new Error(`Supabase deleteResultById failed: ${error.message}`);
  }
}