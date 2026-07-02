export type GamePhase = "bank" | "market" | "behavioral" | "esg" | "life" | "entrepreneur";

export type Sector = "banking" | "energy" | "telecom" | "real_estate" | "industry" | "tech" | "agriculture";

export type LoanType = "low_interest" | "high_interest" | "fast_risky";

export type AssetType = "apartment" | "car" | "company" | "renewable_energy" | "startup";

export type Trend = "up" | "down" | "stable";

export type EsgCategory = "low" | "medium" | "high";

export interface Stock {
  id: number;
  symbol: string;
  name: string;
  sector: Sector;
  price: number;
  previousPrice: number;
  volatility: number;
  risk: number;
  esgScore: number;
  esgCategory: EsgCategory;
  dividend: number;
  marketCap: string;
  description: string;
  newsImpact: number;
  trend: Trend;
  allTimeHigh: number;
  allTimeLow: number;
  isActive: boolean;
}

export interface PlayerStock {
  stockId: number;
  shares: number;
  avgBuyPrice: number;
  totalInvested: number;
}

export interface Loan {
  id: string;
  type: LoanType;
  amount: number;
  interestRate: number;
  monthlyPayment: number;
  remainingBalance: number;
  totalPaid: number;
  monthsRemaining: number;
  totalMonths: number;
  penaltyRate: number;
  isDefaulted: boolean;
  isPaidOff: boolean;
}

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  cost: number;
  monthlyIncome: number;
  monthlyExpense: number;
  prestigeLevel: number;
  riskImpact: number;
  esgImpact: number;
  isActive: boolean;
}

export interface PlayerCompany {
  id: string;
  name: string;
  sector: Sector;
  employees: number;
  revenue: number;
  monthlyCosts: number;
  esgRating: number;
  isPublic: boolean;
  sharePrice: number;
  totalShares: number;
  playerShares: number;
  valuation: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  type: "buy" | "sell" | "dividend" | "loan" | "payment" | "salary" | "expense" | "asset_purchase" | "company_revenue";
  stockSymbol?: string;
  amount: number;
  shares?: number;
  pricePerShare?: number;
  description: string;
  day: number;
  month: number;
  year: number;
}

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  sector: Sector | "all";
  impactType: "positive" | "negative" | "mixed";
  impactStrength: number;
  day: number;
  month: number;
  year: number;
  isActive: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  condition: string;
  completed: boolean;
}

export interface BehavioralInsight {
  type: string;
  message: string;
  day: number;
  month: number;
  year: number;
}

export interface GameState {
  playerId: string;
  playerName: string;
  cash: number;
  debt: number;
  creditScore: number;
  netWorth: number;
  esgScore: number;
  riskLevel: number;
  level: number;
  xp: number;
  phase: GamePhase;
  day: number;
  month: number;
  year: number;
  salary: number;
  monthlyExpenses: number;
  hasLoan: boolean;
  loanApproved: boolean;
  totalProfit: number;
  totalLoss: number;
  tradesCount: number;
  consecutiveLosses: number;
  behavioralFlags: string[];
  completedMissions: string[];
  unlockedAssets: string[];
  activeCompanies: number;
  bankruptcyCount: number;
  daysPlayed: number;
  stocks: Stock[];
  portfolio: PlayerStock[];
  loans: Loan[];
  assets: Asset[];
  companies: PlayerCompany[];
  transactions: Transaction[];
  marketEvents: MarketEvent[];
  behavioralInsights: BehavioralInsight[];
  lastPlayedAt: number;
  isPaused: boolean;
  gameSpeed: number;
}

export interface LoanOption {
  type: LoanType;
  name: string;
  description: string;
  interestRate: number;
  months: number;
  penaltyRate: number;
  maxAmount: number;
  minCreditScore: number;
}

export interface AssetTemplate {
  type: AssetType;
  name: string;
  cost: number;
  monthlyIncome: number;
  monthlyExpense: number;
  prestigeLevel: number;
  riskImpact: number;
  esgImpact: number;
  requiredLevel: number;
  description: string;
}
export interface GameState {
  playerId: string;
  playerName: string;
  cash: number;
  debt: number;
  creditScore: number;
  netWorth: number;
  esgScore: number;
  riskLevel: number;
  level: number;
  xp: number;
  phase: GamePhase;
  day: number;
  month: number;
  year: number;
  salary: number;
  monthlyExpenses: number;
  hasLoan: boolean;
  loanApproved: boolean;
  totalProfit: number;
  totalLoss: number;
  tradesCount: number;
  consecutiveLosses: number;
  behavioralFlags: string[];
  completedMissions: string[];
  unlockedAssets: string[];
  activeCompanies: number;
  bankruptcyCount: number;
  stocks: Stock[];
  portfolio: PlayerStock[];
  loans: Loan[];
  assets: Asset[];
  companies: PlayerCompany[];
  transactions: Transaction[];
  marketEvents: MarketEvent[];
  behavioralInsights: BehavioralInsight[];
  lastPlayedAt: number;
  isPaused: boolean;
  gameSpeed: number;
}
export type GameAction =
  | { type: "INIT_GAME"; payload: { playerName: string } }
  | { type: "LOAD_GAME"; payload: GameState }
  | { type: "ADVANCE_DAY" }
  | { type: "ADVANCE_MONTH" }
  | { type: "SET_SPEED"; payload: number }
  | { type: "PAUSE"; payload: boolean }
  | { type: "APPLY_LOAN"; payload: Loan }
  | { type: "MAKE_PAYMENT"; payload: { loanId: string; amount: number } }
  | { type: "BUY_STOCK"; payload: { stockId: number; shares: number; price: number } }
  | { type: "SELL_STOCK"; payload: { stockId: number; shares: number; price: number } }
  | { type: "PURCHASE_ASSET"; payload: Asset }
  | { type: "CREATE_COMPANY"; payload: PlayerCompany }
  | { type: "UPDATE_COMPANY"; payload: PlayerCompany }
  | { type: "ADD_XP"; payload: number }
  | { type: "COMPLETE_MISSION"; payload: string }
  | { type: "ADD_BEHAVIORAL_FLAG"; payload: string }
  | { type: "ADD_INSIGHT"; payload: BehavioralInsight }
  | { type: "UPDATE_PHASE"; payload: GamePhase }
  | { type: "GO_BANKRUPT" }
  | { type: "RESET_DAY" };
