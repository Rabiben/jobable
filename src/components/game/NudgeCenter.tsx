"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useGame } from "@/game/GameProvider";
import { getOrCreatePlayerId } from "@/lib/playerId";
import { getNudge } from "@/lib/aiCoachApi";
import type { GameState } from "@/game/types";

type Toast = { id: string; message: string };

// Minimum real-world time between two AI-generated nudges, regardless of how
// many triggers fire in that window. Protects the free API quota and keeps
// the UX from feeling spammy. Raise this if you're running long sessions.
const COOLDOWN_MS = 45 * 1000;

// How long a notification stays on screen before auto-dismissing.
const TOAST_DURATION_MS = 12 * 1000;

// Hard cap on toasts shown at once, in case several manage to queue up
// despite the cooldown (e.g. a nudge landing right as an older one expires).
// Keeps the stack from growing unbounded during long sessions.
const MAX_VISIBLE_TOASTS = 3;

// Portfolio share (0-1) in a single sector before we consider it "concentrated".
const CONCENTRATION_THRESHOLD = 0.7;

// Consecutive losses before we flag a possible loss-aversion pattern.
const LOSS_STREAK_THRESHOLD = 3;

function buildStockSummaries(state: GameState) {
  return state.stocks.map((s) => ({
    symbol: s.symbol,
    name: s.name,
    sector: s.sector,
    price: s.price,
    previousPrice: s.previousPrice,
    trend: s.trend,
    volatility: s.volatility,
    esgCategory: s.esgCategory,
  }));
}

function buildNewsSummaries(state: GameState) {
  return state.marketEvents
    .filter((e) => e.isActive)
    .map((e) => ({
      title: e.title,
      description: e.description,
      sector: e.sector,
      impactType: e.impactType,
    }));
}

function buildPortfolioSummary(state: GameState): string {
  if (state.portfolio.length === 0) return "Aucune position pour le moment.";
  return state.portfolio
    .map((h) => {
      const stock = state.stocks.find((s) => s.id === h.stockId);
      if (!stock) return null;
      return `${stock.symbol}: ${h.shares} actions`;
    })
    .filter(Boolean)
    .join(", ");
}

function getDominantSectorShare(state: GameState): { sector: string; share: number } | null {
  if (state.portfolio.length === 0) return null;
  const bySector = new Map<string, number>();
  let total = 0;

  for (const h of state.portfolio) {
    const stock = state.stocks.find((s) => s.id === h.stockId);
    if (!stock) continue;
    const value = stock.price * h.shares;
    total += value;
    bySector.set(stock.sector, (bySector.get(stock.sector) ?? 0) + value);
  }
  if (total === 0) return null;

  let topSector = "";
  let topValue = 0;
  for (const [sector, value] of bySector) {
    if (value > topValue) {
      topValue = value;
      topSector = sector;
    }
  }
  return { sector: topSector, share: topValue / total };
}

export default function NudgeCenter() {
  const { state } = useGame();
  console.log("[nudge] NudgeCenter mounted, tradesCount:", state.tradesCount);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const lastNudgeAtRef = useRef(0);
  const lastTradesCountRef = useRef(state.tradesCount);
  const notifiedConcentrationRef = useRef(false);
  const notifiedNewsIdsRef = useRef(new Set<string>());
  const lastLossStreakNotifiedRef = useRef(0);
  const isFirstRenderRef = useRef(true);

  // Tracks pending auto-dismiss timers so we can clear them on unmount —
  // otherwise a toast fired right before the player navigates away would
  // still fire its setTimeout and try to update state after unmount.
  const dismissTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const timers = dismissTimersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  function dismiss(id: string) {
    const timer = dismissTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      dismissTimersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function pushToast(message: string) {
    const id = crypto.randomUUID();
    setToasts((prev) => {
      const next = [...prev, { id, message }];
      // Drop the oldest toasts first if we're over the cap, rather than
      // silently refusing to show the newest one.
      return next.length > MAX_VISIBLE_TOASTS ? next.slice(next.length - MAX_VISIBLE_TOASTS) : next;
    });
    const timer = setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    dismissTimersRef.current.set(id, timer);
  }

  async function fireNudge(
    triggerType: "post_trade" | "concentration" | "news_impact" | "loss_streak",
    contextSummary: string,
    relatedStockSymbols: string[] = [],
  ) {
    // TEMP DEBUG — retirer une fois le bug trouvé
    console.log("[nudge] fireNudge called:", triggerType, contextSummary);

    const now = Date.now();
    if (now - lastNudgeAtRef.current < COOLDOWN_MS) {
      console.log(
        "[nudge] blocked by cooldown, remaining ms:",
        COOLDOWN_MS - (now - lastNudgeAtRef.current),
      );
      return;
    }
    lastNudgeAtRef.current = now;

    try {
      console.log("[nudge] calling getNudge...");
      const result = await getNudge({
        data: {
          playerId: getOrCreatePlayerId(),
          playerName: state.playerName,
          triggerType,
          contextSummary,
          relatedStockSymbols,
          stocks: buildStockSummaries(state),
          news: buildNewsSummaries(state),
          portfolioSummary: buildPortfolioSummary(state),
          riskLevel: state.riskLevel,
          esgScore: state.esgScore,
        },
      });
      console.log("[nudge] getNudge resolved:", result);
      pushToast(result.message);
      console.log("[nudge] pushToast called");
    } catch (err) {
      console.error("Nudge error:", err);
    }
  }

  // Skip all trigger checks on the very first render — we only want to react
  // to changes that happen *during* play, not the initial state on load.
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      lastTradesCountRef.current = state.tradesCount;
      lastLossStreakNotifiedRef.current = state.consecutiveLosses;
      return;
    }

    // 1. Post-trade reflection
    if (state.tradesCount > lastTradesCountRef.current) {
      lastTradesCountRef.current = state.tradesCount;
      const last = state.transactions[state.transactions.length - 1];
      if (last && (last.type === "buy" || last.type === "sell")) {
        void fireNudge(
          "post_trade",
          `Le joueur vient de ${last.type === "buy" ? "acheter" : "vendre"} ${last.shares ?? ""} action(s) ${last.stockSymbol ?? ""} à ${last.pricePerShare ?? ""} DH.`,
          last.stockSymbol ? [last.stockSymbol] : [],
        );
      }
    }

    // 2. Portfolio concentration
    const dominant = getDominantSectorShare(state);
    if (dominant && dominant.share >= CONCENTRATION_THRESHOLD) {
      if (!notifiedConcentrationRef.current) {
        notifiedConcentrationRef.current = true;
        void fireNudge(
          "concentration",
          `Le portefeuille du joueur est concentré à ${Math.round(dominant.share * 100)}% sur le secteur ${dominant.sector}.`,
        );
      }
    } else {
      // Reset so a future re-concentration can trigger again.
      notifiedConcentrationRef.current = false;
    }

    // 3. News impacting an owned stock
    const ownedSectors = new Set(
      state.portfolio
        .map((h) => state.stocks.find((s) => s.id === h.stockId)?.sector)
        .filter(Boolean),
    );
    for (const event of state.marketEvents) {
      if (!event.isActive) continue;
      if (notifiedNewsIdsRef.current.has(event.id)) continue;
      if (event.sector !== "all" && !ownedSectors.has(event.sector)) continue;

      notifiedNewsIdsRef.current.add(event.id);
      const relatedSymbols = state.portfolio
        .map((h) => state.stocks.find((s) => s.id === h.stockId))
        .filter((s) => s && (event.sector === "all" || s.sector === event.sector))
        .map((s) => s!.symbol);

      void fireNudge(
        "news_impact",
        `Actualité "${event.title}" (impact ${event.impactType}) touche le secteur ${event.sector}, où le joueur détient des positions.`,
        relatedSymbols,
      );
      break; // one nudge per tick is enough even if several events landed at once
    }

    // 4. Loss streak
    if (
      state.consecutiveLosses >= LOSS_STREAK_THRESHOLD &&
      lastLossStreakNotifiedRef.current < LOSS_STREAK_THRESHOLD
    ) {
      void fireNudge(
        "loss_streak",
        `Le joueur vient d'enchaîner ${state.consecutiveLosses} pertes consécutives.`,
      );
    }
    lastLossStreakNotifiedRef.current = state.consecutiveLosses;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tradesCount, state.portfolio, state.marketEvents, state.consecutiveLosses]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 right-5 z-50 flex w-80 flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-2 rounded-xl border border-indigo-400/30 bg-slate-900/95 p-3 text-sm text-white shadow-xl backdrop-blur"
        >
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
          <p className="flex-1">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Fermer la notification"
            className="text-white/40 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}