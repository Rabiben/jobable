import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  upsertResult,
  getAllResults,
  deleteResultById,
  type PlayerResult,
} from "./resultsStore.server";
import {
  deleteRecommendationsByPlayer,
  deleteDecisionsByPlayer,
} from "./aiCoachStore.server";

// Admin password lives only in a server-side env var (never shipped to the
// client). Set ADMIN_PASSWORD in your .env / .dev.vars file. Falls back to a
// default so the feature works out of the box in dev — change this before
// sharing the app with anyone.
function isValidAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim() || "atlas-admin-2026";
  return password === expected;
}

const resultSchema = z.object({
  playerId: z.string().min(1),
  playerName: z.string().min(1).max(60),
  level: z.number(),
  xp: z.number(),
  cash: z.number(),
  debt: z.number(),
  netWorth: z.number(),
  portfolioValue: z.number(),
  creditScore: z.number(),
  esgScore: z.number(),
  riskLevel: z.number(),
  totalProfit: z.number(),
  totalLoss: z.number(),
  tradesCount: z.number(),
  bankruptcyCount: z.number(),
  day: z.number(),
  month: z.number(),
  year: z.number(),
  daysPlayed: z.number(),
  companiesCreated: z.number(),
  assetsOwned: z.number(),
  completedMissions: z.number(),
});

export const submitGameResult = createServerFn({ method: "POST" })
  .validator(resultSchema)
  .handler(async ({ data }) => {
    console.log("submitGameResult reçu:", data);

    const result: PlayerResult = { ...data, submittedAt: Date.now() };
    await upsertResult(result);

    return { success: true as const };
  });

export const adminLogin = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    return { success: isValidAdminPassword(data.password) };
  });

export const fetchAllResults = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    if (!isValidAdminPassword(data.password)) {
      throw new Error("Unauthorized");
    }
    return getAllResults();
  });

export const deleteGameResult = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string(), playerId: z.string() }))
  .handler(async ({ data }) => {
    if (!isValidAdminPassword(data.password)) {
      throw new Error("Unauthorized");
    }
    await Promise.all([
      deleteResultById(data.playerId),
      deleteRecommendationsByPlayer(data.playerId),
      deleteDecisionsByPlayer(data.playerId),
    ]);
    return { success: true as const };
  });