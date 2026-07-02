import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { submitGameResult } from "@/lib/resultsApi";
import { logDecision } from "@/lib/aiCoachApi";
import { getOrCreatePlayerId } from "@/lib/playerId";
import type { GameState } from "./types";

type SubmitStatus = "idle" | "saving" | "saved" | "error";

function buildResultSnapshot(state: GameState) {
  const portfolioValue = state.portfolio.reduce((sum, h) => {
    const stock = state.stocks.find((s) => s.id === h.stockId);
    return sum + (stock ? stock.price * h.shares : 0);
  }, 0);

  return {
    playerId: getOrCreatePlayerId(),
    playerName: state.playerName,
    level: state.level,
    xp: state.xp,
    cash: Math.round(state.cash),
    debt: Math.round(state.debt),
    netWorth: Math.round(state.netWorth),
    portfolioValue: Math.round(portfolioValue),
    creditScore: state.creditScore,
    esgScore: state.esgScore,
    riskLevel: state.riskLevel,
    totalProfit: Math.round(state.totalProfit),
    totalLoss: Math.round(state.totalLoss),
    tradesCount: state.tradesCount,
    bankruptcyCount: state.bankruptcyCount,
    day: state.day,
    month: state.month,
    year: state.year,
    daysPlayed: state.day + (state.month - 1) * 30,
    companiesCreated: state.companies.length,
    assetsOwned: state.assets.filter((a) => a.isActive).length,
    completedMissions: state.completedMissions.length,
  };
}

interface GameContextValue {
  state: GameState;
  submitStatus: SubmitStatus;
  submitResults: () => Promise<void>;
  initGame: (playerName: string) => void;
  loadGame: (savedState: GameState) => void;
  advanceDay: () => void;
  advanceMonth: () => void;
  setSpeed: (speed: number) => void;
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
  applyLoan: (loanType: string, amount: number) => void;
  makePayment: (loanId: string, amount: number) => void;
  buyStock: (stockId: number, shares: number, price: number) => void;
  sellStock: (stockId: number, shares: number, price: number) => void;
  purchaseAsset: (assetType: string) => void;
  createCompany: (name: string, sector: string) => void;
  goPublic: (companyId: string) => void;
  setPhase: (phase: GameState["phase"]) => void;
  resetGame: () => void;
  getPortfolioValue: () => number;
  getUnlockedMissions: () => Array<{ id: string; title: string; description: string; reward: number; condition: string; completed: boolean }>;
  getAvailableAssets: () => Array<{ type: string; name: string; cost: number; monthlyIncome: number; monthlyExpense: number; prestigeLevel: number; riskImpact: number; esgImpact: number; requiredLevel: number; description: string }>;
  getLoanOptions: () => Array<{ type: string; name: string; description: string; interestRate: number; months: number; penaltyRate: number; maxAmount: number; minCreditScore: number }>;
}

const GameContext = createContext<GameContextValue | null>(null);

const SUBMIT_INTERVAL_MS = 60_000;

export function GameProvider({ children }: { children: ReactNode }) {
  const engine = useGameEngine();
  const { state } = engine;
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const lastMonthKeyRef = useRef<string | null>(null);

  const hasProgress = state.playerName !== "Player" || state.day > 1;

  const submitResults = useCallback(async () => {
    if (typeof window === "undefined") return;
    setSubmitStatus("saving");
    try {
      await submitGameResult({ data: buildResultSnapshot(state) });
      setSubmitStatus("saved");
    } catch {
      setSubmitStatus("error");
    }
  }, [state]);

  // Auto-submit whenever a new in-game month starts, so the teacher's admin
  // dashboard stays reasonably up to date without spamming the server on
  // every tick of the fast-forwarded game loop.
  useEffect(() => {
    if (!hasProgress) return;
    const monthKey = `${state.year}-${state.month}`;
    if (lastMonthKeyRef.current === monthKey) return;
    lastMonthKeyRef.current = monthKey;
    void submitResults();
  }, [hasProgress, state.year, state.month, submitResults]);

  // Periodic safety-net submission while a session is open, plus a final
  // submission when the player closes the tab or navigates away.
  useEffect(() => {
    if (!hasProgress) return;
    const interval = setInterval(() => {
      void submitResults();
    }, SUBMIT_INTERVAL_MS);
    const handleUnload = () => {
      void submitResults();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [hasProgress, submitResults]);

  // Wrap buy/sell so every trade is logged alongside the AI recommendation
  // history — this is what lets the admin dashboard compare advice given
  // vs. decisions taken. Logging failures are swallowed on purpose: a slow
  // or failed log write should never block or crash a player's trade.
  const buyStock = useCallback(
    (stockId: number, shares: number, price: number) => {
      engine.buyStock(stockId, shares, price);
      const stock = state.stocks.find((s) => s.id === stockId);
      if (stock) {
        void logDecision({
          data: {
            playerId: getOrCreatePlayerId(),
            action: "buy",
            stockSymbol: stock.symbol,
            shares,
            price,
          },
        }).catch(() => {});
      }
    },
    [engine, state.stocks],
  );

  const sellStock = useCallback(
    (stockId: number, shares: number, price: number) => {
      engine.sellStock(stockId, shares, price);
      const stock = state.stocks.find((s) => s.id === stockId);
      if (stock) {
        void logDecision({
          data: {
            playerId: getOrCreatePlayerId(),
            action: "sell",
            stockSymbol: stock.symbol,
            shares,
            price,
          },
        }).catch(() => {});
      }
    },
    [engine, state.stocks],
  );

  const value: GameContextValue = {
    ...engine,
    buyStock,
    sellStock,
    submitStatus,
    submitResults,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}