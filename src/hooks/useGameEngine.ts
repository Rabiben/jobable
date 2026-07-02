import { useReducer, useCallback, useEffect, useRef } from "react";
import type { GameState, Loan, Asset, PlayerCompany } from "@/game/types";
import { gameReducer, createInitialState } from "@/game/engine";
import { LOAN_OPTIONS, ASSET_TEMPLATES, MISSIONS } from "@/game/constants";

const STORAGE_KEY = "atlas_game_state";

function loadSavedState(): GameState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, isPaused: true };
    }
  } catch {
    // ignore
  }
  return null;
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    const saved = loadSavedState();
    return saved || createInitialState("Player");
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save state on changes
  useEffect(() => {
    if (state.playerName !== "Player" || state.day > 1) {
      saveState(state);
    }
  }, [state]);

  // Game loop
  useEffect(() => {
    if (!state.isPaused && state.gameSpeed > 0) {
      const interval = Math.max(1000, 5000 / state.gameSpeed);
      intervalRef.current = setInterval(() => {
        if (state.day >= 30) {
          dispatch({ type: "ADVANCE_MONTH" });
        } else {
          dispatch({ type: "ADVANCE_DAY" });
        }
      }, interval);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isPaused, state.gameSpeed, state.day]);

  const initGame = useCallback((playerName: string) => {
    dispatch({ type: "INIT_GAME", payload: { playerName } });
  }, []);

  const loadGame = useCallback((savedState: GameState) => {
    dispatch({ type: "LOAD_GAME", payload: savedState });
  }, []);

  const advanceDay = useCallback(() => {
    dispatch({ type: "ADVANCE_DAY" });
  }, []);

  const advanceMonth = useCallback(() => {
    dispatch({ type: "ADVANCE_MONTH" });
  }, []);

  const setSpeed = useCallback((speed: number) => {
    dispatch({ type: "SET_SPEED", payload: speed });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: "PAUSE", payload: true });
  }, []);

  const resume = useCallback(() => {
    dispatch({ type: "PAUSE", payload: false });
  }, []);

  const togglePause = useCallback(() => {
    dispatch({ type: "PAUSE", payload: !state.isPaused });
  }, [state.isPaused]);

  const applyLoan = useCallback((loanType: string, amount: number) => {
    const option = LOAN_OPTIONS.find((o) => o.type === loanType);
    if (!option) return;

    const interest = amount * option.interestRate;
    const total = amount + interest;
    const monthlyPayment = total / option.months;

    const loan: Loan = {
      id: Math.random().toString(36).substring(2, 9),
      type: option.type,
      amount,
      interestRate: option.interestRate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      remainingBalance: Math.round(total * 100) / 100,
      totalPaid: 0,
      monthsRemaining: option.months,
      totalMonths: option.months,
      penaltyRate: option.penaltyRate,
      isDefaulted: false,
      isPaidOff: false,
    };

    dispatch({ type: "APPLY_LOAN", payload: loan });
  }, []);

  const makePayment = useCallback((loanId: string, amount: number) => {
    dispatch({ type: "MAKE_PAYMENT", payload: { loanId, amount } });
  }, []);

  const buyStock = useCallback((stockId: number, shares: number, price: number) => {
    dispatch({ type: "BUY_STOCK", payload: { stockId, shares, price } });
  }, []);

  const sellStock = useCallback((stockId: number, shares: number, price: number) => {
    dispatch({ type: "SELL_STOCK", payload: { stockId, shares, price } });
  }, []);

  const purchaseAsset = useCallback((assetType: string) => {
    const template = ASSET_TEMPLATES.find((a) => a.type === assetType);
    if (!template) return;

    const asset: Asset = {
      id: Math.random().toString(36).substring(2, 9),
      type: template.type,
      name: template.name,
      cost: template.cost,
      monthlyIncome: template.monthlyIncome,
      monthlyExpense: template.monthlyExpense,
      prestigeLevel: template.prestigeLevel,
      riskImpact: template.riskImpact,
      esgImpact: template.esgImpact,
      isActive: true,
    };

    dispatch({ type: "PURCHASE_ASSET", payload: asset });
  }, []);

  const createCompany = useCallback((name: string, sector: string) => {
    const company: PlayerCompany = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      sector: sector as PlayerCompany["sector"],
      employees: 5,
      revenue: 0,
      monthlyCosts: 3000,
      esgRating: 50,
      isPublic: false,
      sharePrice: 10,
      totalShares: 10000,
      playerShares: 10000,
      valuation: 100000,
      isActive: true,
    };

    dispatch({ type: "CREATE_COMPANY", payload: company });
  }, []);

  const goPublic = useCallback((companyId: string) => {
    const company = state.companies.find((c) => c.id === companyId);
    if (!company || company.isPublic) return;

    const updated: PlayerCompany = {
      ...company,
      isPublic: true,
      sharePrice: Math.round(company.valuation / company.totalShares * 100) / 100,
      playerShares: Math.floor(company.totalShares * 0.6),
    };

    dispatch({ type: "UPDATE_COMPANY", payload: updated });
    dispatch({ type: "ADD_XP", payload: 200 });
  }, [state.companies]);

  const setPhase = useCallback((phase: GameState["phase"]) => {
    dispatch({ type: "UPDATE_PHASE", payload: phase });
  }, []);

  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "INIT_GAME", payload: { playerName: "Player" } });
  }, []);

  const getPortfolioValue = useCallback(() => {
    return state.portfolio.reduce((sum, h) => {
      const stock = state.stocks.find((s) => s.id === h.stockId);
      return sum + (stock ? stock.price * h.shares : 0);
    }, 0);
  }, [state.portfolio, state.stocks]);

  const getUnlockedMissions = useCallback(() => {
    return MISSIONS.map((m) => ({
      ...m,
      completed: state.completedMissions.includes(m.id),
    }));
  }, [state.completedMissions]);

  const getAvailableAssets = useCallback(() => {
    return ASSET_TEMPLATES.filter((a) =>
      state.level >= a.requiredLevel && !state.unlockedAssets.includes(a.type)
    );
  }, [state.level, state.unlockedAssets]);

  const getLoanOptions = useCallback(() => {
    return LOAN_OPTIONS.filter((o) => state.creditScore >= o.minCreditScore);
  }, [state.creditScore]);

  return {
    state,
    initGame,
    loadGame,
    advanceDay,
    advanceMonth,
    setSpeed,
    pause,
    resume,
    togglePause,
    applyLoan,
    makePayment,
    buyStock,
    sellStock,
    purchaseAsset,
    createCompany,
    goPublic,
    setPhase,
    resetGame,
    getPortfolioValue,
    getUnlockedMissions,
    getAvailableAssets,
    getLoanOptions,
  };
}
