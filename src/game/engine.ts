import type { GameState, GameAction, Stock, MarketEvent, BehavioralInsight } from "./types";
import {
  STARTING_CASH,
  STARTING_SALARY,
  MONTHLY_EXPENSES,
  STARTING_CREDIT_SCORE,
  XP_LEVELS,
  INITIAL_STOCKS,
  MARKET_EVENT_TEMPLATES,
  COACH_MESSAGES,
} from "./constants";

// ── Utility Functions ─────────────────────────────────────────


// ── Stock Market Simulation (Geometric Brownian Motion) ───────
function simulateStockPrice(stock: Stock, marketEvent: MarketEvent | null): number {
  const dt = 1 / 252;
  const drift = 0.0002;
  const shock = (Math.random() - 0.5) * 2;
  const diffusion = stock.volatility * shock * Math.sqrt(dt);
  const driftComponent = drift * dt;

  let change = driftComponent + diffusion;

  // Apply market event impact — divided by 20 so the total effect is spread
  // across ~20 trading days rather than applied in full each tick.
  if (marketEvent && (marketEvent.sector === "all" || marketEvent.sector === stock.sector)) {
    const direction =
      marketEvent.impactType === "positive" ? 1
      : marketEvent.impactType === "negative" ? -1
      : (Math.random() - 0.5);
    const impact = direction * (marketEvent.impactStrength / 100 / 20) * (0.5 + Math.random() * 0.5);
    change += impact;
  }

  // Apply news impact decay — scale down from per-event to per-tick
  if (stock.newsImpact !== 0) {
    change += (stock.newsImpact / 100 / 20) * 0.3;
  }

  const newPrice = stock.price * (1 + change);
  return round2(Math.max(stock.allTimeLow * 0.8, Math.min(stock.allTimeHigh * 1.1, newPrice)));
}

function updateStockTrend(stock: Stock): "up" | "down" | "stable" {
  const pct = ((stock.price - stock.previousPrice) / stock.previousPrice) * 100;
  if (pct > 1) return "up";
  if (pct < -1) return "down";
  return "stable";
}

// ── Market Event Generation ───────────────────────────────────
function generateMarketEvent(day: number, month: number, year: number): MarketEvent | null {
  if (Math.random() > 0.15) return null;
  const template = MARKET_EVENT_TEMPLATES[Math.floor(Math.random() * MARKET_EVENT_TEMPLATES.length)];
  return {
    id: generateId(),
    ...template,
    day,
    month,
    year,
    isActive: true,
  };
}

// ── Mission Checking ──────────────────────────────────────────
function checkMissions(state: GameState): string[] {
  const completed: string[] = [];
  const holdings = state.portfolio;

  if (state.loanApproved && !state.completedMissions.includes("first_loan")) completed.push("first_loan");
  if (state.tradesCount >= 1 && !state.completedMissions.includes("first_trade")) completed.push("first_trade");

  const sectors = new Set(holdings.map((h) => {
    const stock = state.stocks.find((s) => s.id === h.stockId);
    return stock?.sector;
  }).filter(Boolean));
  if (sectors.size >= 3 && !state.completedMissions.includes("diversified")) completed.push("diversified");

  if (state.month >= 6 && !state.completedMissions.includes("survive_6m")) completed.push("survive_6m");
  if (state.netWorth >= 50000 && !state.completedMissions.includes("worth_50k")) completed.push("worth_50k");
  if (state.netWorth >= 200000 && !state.completedMissions.includes("worth_200k")) completed.push("worth_200k");
  if (state.esgScore >= 80 && !state.completedMissions.includes("esg_champion")) completed.push("esg_champion");
  if (state.activeCompanies >= 1 && !state.completedMissions.includes("first_company")) completed.push("first_company");
  if (state.companies.some((c) => c.isPublic) && !state.completedMissions.includes("ipo_master")) completed.push("ipo_master");
  if (state.loans.length === 0 && state.hasLoan && !state.completedMissions.includes("debt_free")) completed.push("debt_free");

  return completed;
}

// ── Behavioral Analysis ───────────────────────────────────────
function analyzeBehavior(state: GameState): BehavioralInsight | null {
  const recentTransactions = state.transactions.slice(-10);
  if (recentTransactions.length < 3) return null;

  // Overconfidence: many trades in short period
  if (recentTransactions.length >= 5 && state.tradesCount > 0) {
    const buyCount = recentTransactions.filter((t) => t.type === "buy").length;
    if (buyCount >= 4 && !state.behavioralFlags.includes("overconfidence")) {
      return {
        type: "overconfidence",
        message: COACH_MESSAGES.overconfidence[Math.floor(Math.random() * COACH_MESSAGES.overconfidence.length)],
        day: state.day,
        month: state.month,
        year: state.year,
      };
    }
  }

  // Fear selling: selling after consecutive losses
  if (state.consecutiveLosses >= 3 && !state.behavioralFlags.includes("fear_selling")) {
    return {
      type: "fear_selling",
      message: COACH_MESSAGES.fear_selling[Math.floor(Math.random() * COACH_MESSAGES.fear_selling.length)],
      day: state.day,
      month: state.month,
      year: state.year,
    };
  }

  // Herd mentality: buying trending stocks
  const recentBuys = recentTransactions.filter((t) => t.type === "buy" && t.pricePerShare);
  if (recentBuys.length >= 2) {
    const trendingBuys = recentBuys.filter((t) => {
      const stock = state.stocks.find((s) => s.symbol === t.stockSymbol);
      return stock && stock.trend === "up";
    });
    if (trendingBuys.length >= 2 && !state.behavioralFlags.includes("herd_mentality")) {
      return {
        type: "herd_mentality",
        message: COACH_MESSAGES.herd_mentality[Math.floor(Math.random() * COACH_MESSAGES.herd_mentality.length)],
        day: state.day,
        month: state.month,
        year: state.year,
      };
    }
  }

  // Loss aversion: holding losing positions too long (detected by many sell transactions at loss)
  const lossSells = recentTransactions.filter(
    (t) => t.type === "sell" && t.pricePerShare && t.shares && t.pricePerShare * t.shares < 0
  );
  if (lossSells.length >= 2 && !state.behavioralFlags.includes("loss_aversion")) {
    // Actually this pattern is more about holding losers - skip for now
  }

  // Debt warning
  if (state.debt > state.netWorth * 0.5 && !state.behavioralFlags.includes("debt_warning")) {
    return {
      type: "debt_warning",
      message: COACH_MESSAGES.debt_warning[Math.floor(Math.random() * COACH_MESSAGES.debt_warning.length)],
      day: state.day,
      month: state.month,
      year: state.year,
    };
  }

  return null;
}

// ── Calculate Net Worth ───────────────────────────────────────
function calculateNetWorth(state: GameState): number {
  const portfolioValue = state.portfolio.reduce((sum, holding) => {
    const stock = state.stocks.find((s) => s.id === holding.stockId);
    return sum + (stock ? stock.price * holding.shares : 0);
  }, 0);
  const assetValue = state.assets.reduce((sum, a) => sum + a.cost * 0.7, 0);
  const companyValue = state.companies.reduce((sum, c) => sum + c.valuation * (c.playerShares / (c.totalShares || 1)), 0);
  return round2(state.cash + portfolioValue + assetValue + companyValue - state.debt);
}

// ── Calculate ESG Score ───────────────────────────────────────
function calculateESG(state: GameState): number {
  const portfolioESG = state.portfolio.reduce((sum, h) => {
    const stock = state.stocks.find((s) => s.id === h.stockId);
    return sum + (stock ? stock.esgScore * h.shares : 0);
  }, 0);
  const totalShares = state.portfolio.reduce((sum, h) => sum + h.shares, 0);
  const portfolioAvgESG = totalShares > 0 ? portfolioESG / totalShares : 50;

  const assetESG = state.assets.reduce((sum, a) => sum + a.esgImpact, 0);
  const companyESG = state.companies.reduce((sum, c) => sum + (c.esgRating - 50) * 0.2, 0);

  return clamp(Math.round(portfolioAvgESG + assetESG + companyESG), 0, 100);
}

// ── Calculate Risk Level ──────────────────────────────────────
function calculateRisk(state: GameState): number {
  const portfolioRisk = state.portfolio.reduce((sum, h) => {
    const stock = state.stocks.find((s) => s.id === h.stockId);
    return sum + (stock ? stock.risk * h.shares : 0);
  }, 0);
  const totalShares = state.portfolio.reduce((sum, h) => sum + h.shares, 0);
  const avgRisk = totalShares > 0 ? portfolioRisk / totalShares : 0;

  const debtRisk = state.debt > 0 ? Math.min(30, (state.debt / Math.max(state.netWorth, 1)) * 20) : 0;
  const assetRisk = state.assets.reduce((sum, a) => sum + a.riskImpact, 0);

  return clamp(Math.round(avgRisk + debtRisk + assetRisk), 0, 100);
}

// ── Level & XP ────────────────────────────────────────────────
function getLevelFromXp(xp: number): number {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i]) return i + 1;
  }
  return 1;
}
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}
// ── Initial State Factory ─────────────────────────────────────
export function createInitialState(playerName: string): GameState {
  return {
    playerId: generateId(),
    playerName,
    cash: STARTING_CASH,
    debt: 0,
    creditScore: STARTING_CREDIT_SCORE,
    netWorth: STARTING_CASH,
    esgScore: 50,
    riskLevel: 0,
    level: 1,
    xp: 0,
    phase: "bank",
    day: 1,
    month: 1,
    year: 2026,
    salary: STARTING_SALARY,
    monthlyExpenses: MONTHLY_EXPENSES,
    hasLoan: false,
    loanApproved: false,
    totalProfit: 0,
    totalLoss: 0,
    tradesCount: 0,
    consecutiveLosses: 0,
    behavioralFlags: [],
    completedMissions: [],
    unlockedAssets: [],
    activeCompanies: 0,
    bankruptcyCount: 0,
    daysPlayed: 0,
    stocks: INITIAL_STOCKS.map((s) => ({ ...s })),
    portfolio: [],
    loans: [],
    assets: [],
    companies: [],
    transactions: [],
    marketEvents: [],
    behavioralInsights: [],
    lastPlayedAt: Date.now(),
    isPaused: true,
    gameSpeed: 1,
  };
}
// ── Game Reducer ──────────────────────────────────────────────
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INIT_GAME": {
  return createInitialState(action.payload.playerName);
    }

case "LOAD_GAME": {
  return {
    ...action.payload,
    playerId: action.payload.playerId || generateId(),
    daysPlayed: action.payload.daysPlayed ?? 0,
    isPaused: true,
  };
}

    case "ADVANCE_DAY": {
      const newState = { ...state };
      newState.day += 1;
       newState.daysPlayed += 1;

      // Simulate stock prices
      const activeEvent = state.marketEvents.find((e) => e.isActive) || null;
      newState.stocks = state.stocks.map((stock) => {
        const previousPrice = stock.price;
        const newPrice = simulateStockPrice(stock, activeEvent);
        return {
          ...stock,
          previousPrice,
          price: newPrice,
          trend: updateStockTrend({ ...stock, previousPrice, price: newPrice }),
          allTimeHigh: Math.max(stock.allTimeHigh, newPrice),
          allTimeLow: Math.min(stock.allTimeLow, newPrice),
          newsImpact: Math.round(stock.newsImpact * 0.9),
        };
      });

      // Age out old market events
      newState.marketEvents = state.marketEvents
        .map((e) => ({ ...e, isActive: e.isActive && Math.random() > 0.2 }))
        .filter((e) => e.isActive);

      // Generate new market event
      const newEvent = generateMarketEvent(newState.day, newState.month, newState.year);
      if (newEvent) {
        newState.marketEvents = [...newState.marketEvents, newEvent];
        // Apply immediate impact to affected stocks
        newState.stocks = newState.stocks.map((stock) => {
          if (newEvent.sector === "all" || newEvent.sector === stock.sector) {
            return { ...stock, newsImpact: newEvent.impactStrength * (newEvent.impactType === "positive" ? 1 : -1) };
          }
          return stock;
        });
      }

      // Daily dividend check (1% chance per day)
      newState.stocks.forEach((stock) => {
        if (stock.dividend > 0 && Math.random() < 0.01) {
          const holding = newState.portfolio.find((h) => h.stockId === stock.id);
          if (holding && holding.shares > 0) {
            const divAmount = round2(stock.dividend * holding.shares * 0.01);
            newState.cash = round2(newState.cash + divAmount);
            newState.transactions = [...newState.transactions, {
              id: generateId(),
              type: "dividend",
              stockSymbol: stock.symbol,
              amount: divAmount,
              description: `Dividend from ${stock.symbol}`,
              day: newState.day,
              month: newState.month,
              year: newState.year,
            }];
          }
        }
      });

      // Company revenue (if player has companies)
      newState.companies = newState.companies.map((company) => {
        if (!company.isActive) return company;
        const revenue = round2(company.revenue + (Math.random() * company.monthlyCosts * 0.3));
        return { ...company, revenue };
      });

      newState.netWorth = calculateNetWorth(newState);
      newState.esgScore = calculateESG(newState);
      newState.riskLevel = calculateRisk(newState);
      newState.lastPlayedAt = Date.now();

      return newState;
    }

    case "ADVANCE_MONTH": {
      let newState = { ...state };
      newState.month += 1;
      if (newState.month > 12) {
        newState.month = 1;
        newState.year += 1;
      }
      newState.day = 1;

      // Process salary
      newState.cash = round2(newState.cash + newState.salary);
      newState.transactions = [...newState.transactions, {
        id: generateId(),
        type: "salary",
        amount: newState.salary,
        description: `Monthly salary`,
        day: 1,
        month: newState.month,
        year: newState.year,
      }];

      // Process expenses
      newState.cash = round2(newState.cash - newState.monthlyExpenses);
      newState.transactions = [...newState.transactions, {
        id: generateId(),
        type: "expense",
        amount: -newState.monthlyExpenses,
        description: `Monthly expenses`,
        day: 1,
        month: newState.month,
        year: newState.year,
      }];

      // Process asset expenses/income
      newState.assets.forEach((asset) => {
        if (asset.isActive) {
          newState.cash = round2(newState.cash + asset.monthlyIncome - asset.monthlyExpense);
          if (asset.monthlyIncome > 0) {
            newState.transactions = [...newState.transactions, {
              id: generateId(),
              type: "company_revenue",
              amount: asset.monthlyIncome,
              description: `Income from ${asset.name}`,
              day: 1,
              month: newState.month,
              year: newState.year,
            }];
          }
        }
      });

      // Process company costs
      newState.companies = newState.companies.map((company) => {
        if (!company.isActive) return company;
        newState.cash = round2(newState.cash - company.monthlyCosts);
        newState.transactions = [...newState.transactions, {
          id: generateId(),
          type: "expense",
          amount: -company.monthlyCosts,
          description: `Operating costs: ${company.name}`,
          day: 1,
          month: newState.month,
          year: newState.year,
        }];
        return company;
      });

      // Process loan payments
      newState.loans = newState.loans.map((loan) => {
        if (loan.isPaidOff || loan.isDefaulted) return loan;

        if (newState.cash >= loan.monthlyPayment) {
          newState.cash = round2(newState.cash - loan.monthlyPayment);
          newState.transactions = [...newState.transactions, {
            id: generateId(),
            type: "payment",
            amount: -loan.monthlyPayment,
            description: `Loan payment (${loan.type})`,
            day: 1,
            month: newState.month,
            year: newState.year,
          }];

          const newRemaining = round2(loan.remainingBalance - loan.monthlyPayment);
          const isPaidOff = newRemaining <= 0 || loan.monthsRemaining <= 1;

          if (isPaidOff) {
            newState.debt = round2(newState.debt - loan.amount);
            newState.creditScore = clamp(newState.creditScore + 30, 0, 850);
            newState.hasLoan = newState.loans.filter((l) => !l.isPaidOff && l.id !== loan.id).length > 0;
          }

          return {
            ...loan,
            remainingBalance: isPaidOff ? 0 : newRemaining,
            totalPaid: round2(loan.totalPaid + loan.monthlyPayment),
            monthsRemaining: Math.max(0, loan.monthsRemaining - 1),
            isPaidOff,
          };
        } else {
          // Default - can't pay
          const penalty = round2(loan.remainingBalance * loan.penaltyRate);
          newState.cash = round2(newState.cash - penalty);
          newState.creditScore = clamp(newState.creditScore - 50, 0, 850);

          // If cash negative, confiscate stocks
          if (newState.cash < 0) {
            const portfolioValue = newState.portfolio.reduce((sum, h) => {
              const stock = newState.stocks.find((s) => s.id === h.stockId);
              return sum + (stock ? stock.price * h.shares : 0);
            }, 0);
            if (portfolioValue > 0) {
              newState.portfolio = [];
              newState.transactions = [...newState.transactions, {
                id: generateId(),
                type: "expense",
                amount: -portfolioValue,
                description: "Bank confiscated stocks due to loan default!",
                day: 1,
                month: newState.month,
                year: newState.year,
              }];
            }
            newState.cash = 0;
          }

          return { ...loan, isDefaulted: true };
        }
      });

      // Check bankruptcy
      if (newState.cash < -5000 && newState.netWorth < 0) {
        newState.bankruptcyCount += 1;
        newState.cash = STARTING_CASH;
        newState.debt = 0;
        newState.loans = [];
        newState.portfolio = [];
        newState.creditScore = Math.max(200, newState.creditScore - 100);
        newState.consecutiveLosses += 1;
      }

      // Check missions
      const completedMissions = checkMissions(newState);
      if (completedMissions.length > 0) {
        const newCompleted = completedMissions.filter((m) => !newState.completedMissions.includes(m));
        if (newCompleted.length > 0) {
          newState.completedMissions = [...newState.completedMissions, ...newCompleted];
          const xpGain = newCompleted.length * 50;
          newState.xp += xpGain;
        }
      }

      // Update level
      newState.level = getLevelFromXp(newState.xp);

      // Check phase unlocks
      // Phase unlocks checked automatically by level

      // Behavioral analysis
      const insight = analyzeBehavior(newState);
      if (insight) {
        newState.behavioralInsights = [...newState.behavioralInsights, insight];
        newState.behavioralFlags = [...newState.behavioralFlags, insight.type];
      }

      newState.netWorth = calculateNetWorth(newState);
      newState.esgScore = calculateESG(newState);
      newState.riskLevel = calculateRisk(newState);
      newState.lastPlayedAt = Date.now();

      return newState;
    }

    case "SET_SPEED": {
      return { ...state, gameSpeed: action.payload };
    }

    case "PAUSE": {
      return { ...state, isPaused: action.payload };
    }

    case "APPLY_LOAN": {
      const loan = action.payload;
      const newState = { ...state };
      newState.loans = [...newState.loans, loan];
      newState.cash = round2(newState.cash + loan.amount);
      newState.debt = round2(newState.debt + loan.remainingBalance);
      newState.hasLoan = true;
      newState.loanApproved = true;
      newState.transactions = [...newState.transactions, {
        id: generateId(),
        type: "loan",
        amount: loan.amount,
        description: `Loan approved: ${loan.type} (${loan.amount.toLocaleString()} MAD)`,
        day: newState.day,
        month: newState.month,
        year: newState.year,
      }];
      newState.creditScore = clamp(newState.creditScore + 10, 0, 850);
      newState.xp += 20;
      newState.netWorth = calculateNetWorth(newState);
      return newState;
    }

    case "MAKE_PAYMENT": {
      const { loanId, amount } = action.payload;
      const newState = { ...state };
      if (newState.cash >= amount) {
        newState.cash = round2(newState.cash - amount);
        newState.loans = newState.loans.map((loan) => {
          if (loan.id === loanId) {
            const newRemaining = round2(loan.remainingBalance - amount);
            const isPaidOff = newRemaining <= 0;
            return {
              ...loan,
              remainingBalance: isPaidOff ? 0 : newRemaining,
              totalPaid: round2(loan.totalPaid + amount),
              monthsRemaining: isPaidOff ? 0 : loan.monthsRemaining,
              isPaidOff,
            };
          }
          return loan;
        });
        newState.creditScore = clamp(newState.creditScore + 5, 0, 850);
        newState.transactions = [...newState.transactions, {
          id: generateId(),
          type: "payment",
          amount: -amount,
          description: `Extra payment on loan`,
          day: newState.day,
          month: newState.month,
          year: newState.year,
        }];
        newState.debt = round2(newState.loans.reduce((sum, l) => sum + (l.isPaidOff ? 0 : l.remainingBalance), 0));
        newState.hasLoan = newState.loans.some((l) => !l.isPaidOff && !l.isDefaulted);
      }
      newState.netWorth = calculateNetWorth(newState);
      return newState;
    }

    case "BUY_STOCK": {
      const { stockId, shares, price } = action.payload;
      const totalCost = round2(price * shares);
      const newState = { ...state };

      if (newState.cash >= totalCost) {
        newState.cash = round2(newState.cash - totalCost);
        const existingHolding = newState.portfolio.find((h) => h.stockId === stockId);
        const stock = newState.stocks.find((s) => s.id === stockId);

        if (existingHolding) {
          const totalShares = existingHolding.shares + shares;
          const newAvgPrice = round2((existingHolding.avgBuyPrice * existingHolding.shares + price * shares) / totalShares);
          newState.portfolio = newState.portfolio.map((h) =>
            h.stockId === stockId
              ? { ...h, shares: totalShares, avgBuyPrice: newAvgPrice, totalInvested: round2(h.totalInvested + totalCost) }
              : h
          );
        } else {
          newState.portfolio = [...newState.portfolio, {
            stockId,
            shares,
            avgBuyPrice: price,
            totalInvested: totalCost,
          }];
        }

        newState.tradesCount += 1;
        newState.transactions = [...newState.transactions, {
          id: generateId(),
          type: "buy",
          stockSymbol: stock?.symbol,
          amount: -totalCost,
          shares,
          pricePerShare: price,
          description: `Bought ${shares} shares of ${stock?.symbol} at ${price} MAD`,
          day: newState.day,
          month: newState.month,
          year: newState.year,
        }];
        newState.xp += 10;
        newState.consecutiveLosses = 0;
      }
      newState.netWorth = calculateNetWorth(newState);
      newState.esgScore = calculateESG(newState);
      newState.riskLevel = calculateRisk(newState);
      return newState;
    }

    case "SELL_STOCK": {
      const { stockId, shares, price } = action.payload;
      const newState = { ...state };
      const holding = newState.portfolio.find((h) => h.stockId === stockId);
      const stock = newState.stocks.find((s) => s.id === stockId);

      if (holding && holding.shares >= shares) {
        const totalRevenue = round2(price * shares);
        const costBasis = round2(holding.avgBuyPrice * shares);
        const profit = round2(totalRevenue - costBasis);

        newState.cash = round2(newState.cash + totalRevenue);

        if (profit > 0) {
          newState.totalProfit = round2(newState.totalProfit + profit);
          newState.consecutiveLosses = 0;
        } else {
          newState.totalLoss = round2(newState.totalLoss + Math.abs(profit));
          newState.consecutiveLosses += 1;
        }

        if (holding.shares === shares) {
          newState.portfolio = newState.portfolio.filter((h) => h.stockId !== stockId);
        } else {
          newState.portfolio = newState.portfolio.map((h) =>
            h.stockId === stockId
              ? { ...h, shares: h.shares - shares, totalInvested: round2(h.totalInvested - costBasis) }
              : h
          );
        }

        newState.tradesCount += 1;
        newState.transactions = [...newState.transactions, {
          id: generateId(),
          type: "sell",
          stockSymbol: stock?.symbol,
          amount: totalRevenue,
          shares,
          pricePerShare: price,
          description: `Sold ${shares} shares of ${stock?.symbol} at ${price} MAD (${profit >= 0 ? "+" : ""}${profit.toFixed(2)})`,
          day: newState.day,
          month: newState.month,
          year: newState.year,
        }];
        newState.xp += 10;
      }
      newState.netWorth = calculateNetWorth(newState);
      newState.esgScore = calculateESG(newState);
      newState.riskLevel = calculateRisk(newState);
      return newState;
    }

    case "PURCHASE_ASSET": {
      const asset = action.payload;
      const newState = { ...state };
      if (newState.cash >= asset.cost) {
        newState.cash = round2(newState.cash - asset.cost);
        newState.assets = [...newState.assets, asset];
        newState.unlockedAssets = [...newState.unlockedAssets, asset.type];
        newState.transactions = [...newState.transactions, {
          id: generateId(),
          type: "asset_purchase",
          amount: -asset.cost,
          description: `Purchased: ${asset.name}`,
          day: newState.day,
          month: newState.month,
          year: newState.year,
        }];
        newState.xp += 50;
      }
      newState.netWorth = calculateNetWorth(newState);
      newState.esgScore = calculateESG(newState);
      newState.riskLevel = calculateRisk(newState);
      return newState;
    }

    case "CREATE_COMPANY": {
      const company = action.payload;
      const newState = { ...state };
      if (newState.cash >= 50000) {
        newState.cash = round2(newState.cash - 50000);
        newState.companies = [...newState.companies, company];
        newState.activeCompanies += 1;
        newState.transactions = [...newState.transactions, {
          id: generateId(),
          type: "asset_purchase",
          amount: -50000,
          description: `Founded company: ${company.name}`,
          day: newState.day,
          month: newState.month,
          year: newState.year,
        }];
        newState.xp += 100;
      }
      newState.netWorth = calculateNetWorth(newState);
      return newState;
    }

    case "UPDATE_COMPANY": {
      const updated = action.payload;
      return {
        ...state,
        companies: state.companies.map((c) => c.id === updated.id ? updated : c),
      };
    }

    case "ADD_XP": {
      const newXp = state.xp + action.payload;
      return {
        ...state,
        xp: newXp,
        level: getLevelFromXp(newXp),
      };
    }

    case "COMPLETE_MISSION": {
      if (!state.completedMissions.includes(action.payload)) {
        return {
          ...state,
          completedMissions: [...state.completedMissions, action.payload],
        };
      }
      return state;
    }

    case "ADD_BEHAVIORAL_FLAG": {
      if (!state.behavioralFlags.includes(action.payload)) {
        return {
          ...state,
          behavioralFlags: [...state.behavioralFlags, action.payload],
        };
      }
      return state;
    }

    case "ADD_INSIGHT": {
      return {
        ...state,
        behavioralInsights: [...state.behavioralInsights, action.payload],
      };
    }

    case "UPDATE_PHASE": {
      return { ...state, phase: action.payload };
    }

case "GO_BANKRUPT": {
  const newState = {
    ...state,
    cash: STARTING_CASH,
    debt: 0,
    loans: [],
    portfolio: [],
    bankruptcyCount: state.bankruptcyCount + 1,
    creditScore: Math.max(200, state.creditScore - 100),
    consecutiveLosses: state.consecutiveLosses + 1,
  };

  return {
    ...newState,
    netWorth: calculateNetWorth(newState),
    esgScore: calculateESG(newState),
    riskLevel: calculateRisk(newState),
  };
}

    case "RESET_DAY": {
      return { ...state, day: 1 };
    }

    default:
      return state;
  }
}