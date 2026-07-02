import type { LoanOption, AssetTemplate, Mission, Stock, MarketEvent } from "./types";

export const STARTING_CASH = 5000;
export const STARTING_SALARY = 5000;
export const MONTHLY_EXPENSES = 2000;
export const STARTING_CREDIT_SCORE = 300;
export const MAX_CREDIT_SCORE = 850;
export const DAYS_PER_MONTH = 30;

export const XP_LEVELS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000, 13000, 17000, 22000];

export const PHASE_UNLOCKS: Record<string, number> = {
  bank: 1,
  market: 1,
  behavioral: 2,
  esg: 3,
  life: 4,
  entrepreneur: 6,
};

export const LOAN_OPTIONS: LoanOption[] = [
  {
    type: "low_interest",
    name: "Classic Credit",
    description: "Low interest rate with strict repayment terms. Best for careful investors.",
    interestRate: 0.05,
    months: 24,
    penaltyRate: 0.02,
    maxAmount: 50000,
    minCreditScore: 350,
  },
  {
    type: "high_interest",
    name: "Flexible Credit",
    description: "Higher interest but flexible conditions. Good for quick investments.",
    interestRate: 0.12,
    months: 12,
    penaltyRate: 0.05,
    maxAmount: 100000,
    minCreditScore: 300,
  },
  {
    type: "fast_risky",
    name: "Fast Cash",
    description: "Quick money with very high risk. Dangerous but can jump-start your journey.",
    interestRate: 0.25,
    months: 6,
    penaltyRate: 0.1,
    maxAmount: 20000,
    minCreditScore: 250,
  },
];

export const ASSET_TEMPLATES: AssetTemplate[] = [
  {
    type: "apartment",
    name: "Maarif Apartment",
    cost: 150000,
    monthlyIncome: 0,
    monthlyExpense: 1500,
    prestigeLevel: 2,
    riskImpact: -5,
    esgImpact: 0,
    requiredLevel: 4,
    description: "Modern apartment in Casablanca's Maarif district. Reduces living expenses.",
  },
  {
    type: "car",
    name: "Moroccan Sedan",
    cost: 80000,
    monthlyIncome: 0,
    monthlyExpense: 800,
    prestigeLevel: 1,
    riskImpact: -2,
    esgImpact: -5,
    requiredLevel: 3,
    description: "Reliable vehicle for business meetings across Casablanca.",
  },
  {
    type: "company",
    name: "New Company",
    cost: 50000,
    monthlyIncome: 0,
    monthlyExpense: 3000,
    prestigeLevel: 3,
    riskImpact: 10,
    esgImpact: 0,
    requiredLevel: 6,
    description: "Start your own business. High risk, high reward entrepreneurship.",
  },
  {
    type: "renewable_energy",
    name: "Solar Farm Project",
    cost: 200000,
    monthlyIncome: 2500,
    monthlyExpense: 500,
    prestigeLevel: 4,
    riskImpact: 5,
    esgImpact: 20,
    requiredLevel: 7,
    description: "Invest in Morocco's solar energy future. Great for ESG score.",
  },
  {
    type: "startup",
    name: "Tech Startup",
    cost: 100000,
    monthlyIncome: 0,
    monthlyExpense: 5000,
    prestigeLevel: 5,
    riskImpact: 15,
    esgImpact: 5,
    requiredLevel: 8,
    description: "Launch a tech startup in Casablanca's innovation hub.",
  },
];

export const MISSIONS: Mission[] = [
  { id: "first_loan", title: "First Steps", description: "Get your first loan approved", reward: 100, condition: "loan_approved", completed: false },
  { id: "first_trade", title: "Market Entry", description: "Make your first stock trade", reward: 50, condition: "first_trade", completed: false },
  { id: "diversified", title: "Diversified Investor", description: "Hold stocks from 3 different sectors", reward: 200, condition: "diversified", completed: false },
  { id: "survive_6m", title: "Survivor", description: "Avoid bankruptcy for 6 months", reward: 300, condition: "survive_6m", completed: false },
  { id: "worth_50k", title: "Growing Wealth", description: "Reach 50,000 MAD net worth", reward: 250, condition: "worth_50k", completed: false },
  { id: "worth_200k", title: "Wealth Builder", description: "Reach 200,000 MAD net worth", reward: 500, condition: "worth_200k", completed: false },
  { id: "esg_champion", title: "ESG Champion", description: "Reach 80+ ESG score", reward: 400, condition: "esg_champion", completed: false },
  { id: "first_company", title: "Entrepreneur", description: "Launch your first company", reward: 600, condition: "first_company", completed: false },
  { id: "ipo_master", title: "IPO Master", description: "Take a company public", reward: 1000, condition: "ipo_master", completed: false },
  { id: "debt_free", title: "Debt Free", description: "Pay off all loans completely", reward: 300, condition: "debt_free", completed: false },
];

// Prices anchored to real Bourse de Casablanca quotes (June 2025).
// Sources: casabourse.ma, casablancabourse.com, investing.com/equities/
// allTimeHigh / allTimeLow are approximate 52-week ranges.
export const INITIAL_STOCKS: Stock[] = [
  { id: 1,  symbol: "ATW",  name: "Attijariwafa Bank",         sector: "banking",     price: 685,  previousPrice: 681,  volatility: 0.012, risk: 25, esgScore: 55, esgCategory: "medium", dividend: 12, marketCap: "85B MAD",  description: "Morocco's largest bank with expanding African operations",       newsImpact: 0, trend: "stable", allTimeHigh: 804,  allTimeLow: 620,  isActive: true },
  { id: 2,  symbol: "BCP",  name: "Banque Centrale Populaire", sector: "banking",     price: 262,  previousPrice: 259,  volatility: 0.015, risk: 28, esgScore: 52, esgCategory: "medium", dividend: 10, marketCap: "62B MAD",  description: "Major banking group with strong rural presence",                  newsImpact: 0, trend: "up",     allTimeHigh: 310,  allTimeLow: 228,  isActive: true },
  { id: 3,  symbol: "IAM",  name: "Maroc Telecom",             sector: "telecom",     price: 92,   previousPrice: 92,   volatility: 0.010, risk: 20, esgScore: 58, esgCategory: "medium", dividend: 8,  marketCap: "120B MAD", description: "Leading telecommunications operator in Morocco",                  newsImpact: 0, trend: "stable", allTimeHigh: 115,  allTimeLow: 78,   isActive: true },
  { id: 4,  symbol: "LAF",  name: "LafargeHolcim Maroc",       sector: "industry",    price: 1760, previousPrice: 1750, volatility: 0.018, risk: 35, esgScore: 45, esgCategory: "low",    dividend: 25, marketCap: "48B MAD",  description: "Construction materials and cement production",                  newsImpact: 0, trend: "up",     allTimeHigh: 2050, allTimeLow: 1480, isActive: true },
  { id: 5,  symbol: "ONEE", name: "ONEE (Energy Utility)",     sector: "energy",      price: 88,   previousPrice: 87,   volatility: 0.016, risk: 30, esgScore: 68, esgCategory: "high",   dividend: 3,  marketCap: "35B MAD",  description: "National electricity and water utility, investing in renewables", newsImpact: 0, trend: "stable", allTimeHigh: 105,  allTimeLow: 72,   isActive: true },
  { id: 6,  symbol: "MASM", name: "MASEN (Solar Energy)",      sector: "energy",      price: 58,   previousPrice: 56,   volatility: 0.030, risk: 45, esgScore: 92, esgCategory: "high",   dividend: 0,  marketCap: "18B MAD",  description: "Moroccan Agency for Sustainable Energy — pure green play",      newsImpact: 0, trend: "up",     allTimeHigh: 78,   allTimeLow: 40,   isActive: true },
  { id: 7,  symbol: "ADD",  name: "Addoha Group",              sector: "real_estate", price: 34,   previousPrice: 35,   volatility: 0.025, risk: 40, esgScore: 35, esgCategory: "low",    dividend: 0,  marketCap: "8B MAD",   description: "Real estate development company",                              newsImpact: 0, trend: "down",   allTimeHigh: 50,   allTimeLow: 27,   isActive: true },
  { id: 8,  symbol: "COS",  name: "Cosumar",                   sector: "agriculture", price: 190,  previousPrice: 189,  volatility: 0.020, risk: 32, esgScore: 60, esgCategory: "high",   dividend: 6,  marketCap: "28B MAD",  description: "Sugar production and agricultural processing",                  newsImpact: 0, trend: "stable", allTimeHigh: 230,  allTimeLow: 160,  isActive: true },
  { id: 9,  symbol: "SMI",  name: "Société Métallurgique",     sector: "industry",    price: 5900, previousPrice: 5980, volatility: 0.025, risk: 42, esgScore: 38, esgCategory: "low",    dividend: 15, marketCap: "22B MAD",  description: "Mining and metallurgical processing",                          newsImpact: 0, trend: "down",   allTimeHigh: 7200, allTimeLow: 4600, isActive: true },
  { id: 10, symbol: "HPS",  name: "HPS (Payment Tech)",        sector: "tech",        price: 620,  previousPrice: 605,  volatility: 0.032, risk: 55, esgScore: 50, esgCategory: "medium", dividend: 0,  marketCap: "15B MAD",  description: "Payment solutions and fintech technology",                     newsImpact: 0, trend: "up",     allTimeHigh: 780,  allTimeLow: 480,  isActive: true },
  { id: 11, symbol: "TGCC", name: "TGCC (Construction)",       sector: "real_estate", price: 766,  previousPrice: 769,  volatility: 0.022, risk: 38, esgScore: 42, esgCategory: "low",    dividend: 8,  marketCap: "12B MAD",  description: "General construction and public works",                        newsImpact: 0, trend: "down",   allTimeHigh: 920,  allTimeLow: 620,  isActive: true },
  { id: 12, symbol: "AFRI", name: "Afriquia Gaz",              sector: "energy",      price: 3750, previousPrice: 3680, volatility: 0.020, risk: 36, esgScore: 40, esgCategory: "low",    dividend: 30, marketCap: "30B MAD",  description: "Petroleum products distribution",                              newsImpact: 0, trend: "up",     allTimeHigh: 4400, allTimeLow: 3100, isActive: true },
  { id: 13, symbol: "ITK",  name: "Itissalat Al-Maghrib Tech", sector: "tech",        price: 105,  previousPrice: 100,  volatility: 0.038, risk: 60, esgScore: 65, esgCategory: "high",   dividend: 0,  marketCap: "10B MAD",  description: "Emerging tech and digital services",                           newsImpact: 0, trend: "up",     allTimeHigh: 160,  allTimeLow: 70,   isActive: true },
  { id: 14, symbol: "DWB",  name: "Delattre Levivier",         sector: "agriculture", price: 40,   previousPrice: 40,   volatility: 0.022, risk: 38, esgScore: 48, esgCategory: "medium", dividend: 5,  marketCap: "14B MAD",  description: "Steel construction and public works",                          newsImpact: 0, trend: "stable", allTimeHigh: 52,   allTimeLow: 32,   isActive: true },
  { id: 15, symbol: "CBM",  name: "Casablanca Marina Dev",     sector: "real_estate", price: 68,   previousPrice: 70,   volatility: 0.028, risk: 48, esgScore: 55, esgCategory: "medium", dividend: 0,  marketCap: "6B MAD",   description: "Luxury waterfront real estate development",                    newsImpact: 0, trend: "down",   allTimeHigh: 90,   allTimeLow: 52,   isActive: true },
];

export const MARKET_EVENT_TEMPLATES: Omit<MarketEvent, "id" | "day" | "month" | "year" | "isActive">[] = [
  { title: "Banking Reform Announced", description: "New regulations boost confidence in the banking sector. Banking stocks may rise.", sector: "banking", impactType: "positive", impactStrength: 5 },
  { title: "Solar Energy Investment", description: "Government announces major solar energy subsidies. Green energy stocks surge.", sector: "energy", impactType: "positive", impactStrength: 8 },
  { title: "Telecom Merger Rumors", description: "Speculation about a major telecom merger drives volatility in the sector.", sector: "telecom", impactType: "mixed", impactStrength: 6 },
  { title: "Real Estate Slowdown", description: "Property sales decline in major cities. Real estate stocks face pressure.", sector: "real_estate", impactType: "negative", impactStrength: 6 },
  { title: "Industrial Output Rises", description: "Manufacturing data shows strong growth. Industrial stocks benefit.", sector: "industry", impactType: "positive", impactStrength: 5 },
  { title: "Tech Startup Boom", description: "Casablanca's tech scene attracts international investors. Tech stocks rally.", sector: "tech", impactType: "positive", impactStrength: 9 },
  { title: "Agricultural Drought", description: "Poor weather conditions affect crop yields. Agriculture stocks decline.", sector: "agriculture", impactType: "negative", impactStrength: 7 },
  { title: "Economic Growth Data", description: "Morocco's GDP growth exceeds expectations. All sectors benefit.", sector: "all", impactType: "positive", impactStrength: 4 },
  { title: "Interest Rate Hike", description: "Central bank raises interest rates. Banking benefits, others face pressure.", sector: "all", impactType: "mixed", impactStrength: 5 },
  { title: "Green Initiative Launch", description: "New environmental policies reward sustainable companies. ESG stocks gain.", sector: "all", impactType: "positive", impactStrength: 6 },
  { title: "Cybersecurity Threat", description: "Major cybersecurity incident raises concerns. Tech sector faces scrutiny.", sector: "tech", impactType: "negative", impactStrength: 7 },
  { title: "Tourism Revival", description: "Record tourist arrivals boost service economy. Diverse market impact.", sector: "all", impactType: "positive", impactStrength: 3 },
  { title: "Oil Price Shock", description: "Global oil price spike affects energy-dependent sectors.", sector: "energy", impactType: "mixed", impactStrength: 8 },
  { title: "5G Rollout Accelerates", description: "Faster 5G deployment drives telecom infrastructure investment.", sector: "telecom", impactType: "positive", impactStrength: 7 },
  { title: "Construction Permits Surge", description: "New building permits hit record highs. Construction stocks rise.", sector: "real_estate", impactType: "positive", impactStrength: 5 },
];

export const COACH_MESSAGES: Record<string, string[]> = {
  overconfidence: [
    "You've made several consecutive trades. Consider whether you're overestimating your market timing ability.",
    "Your trading frequency is high. Research shows frequent traders often underperform the market.",
    "You seem very confident in your predictions. Remember: even experts can't consistently time the market.",
  ],
  fear_selling: [
    "You sold after a price drop. Was this based on fundamentals or fear? Consider holding quality investments through volatility.",
    "Panic selling often locks in losses. Quality companies usually recover from temporary setbacks.",
    "Selling during downturns is a common behavioral trap. Did you analyze before selling?",
  ],
  herd_mentality: [
    "You're buying stocks that recently surged. Are you following the crowd or your own analysis?",
    "Popular stocks aren't always good investments. Independent thinking often leads to better returns.",
    "Consider whether you're investing based on hype or fundamentals.",
  ],
  loss_aversion: [
    "You're holding losing positions too long. Sometimes cutting losses is the rational choice.",
    "Holding onto declining stocks hoping to 'break even' is a common bias. Evaluate based on future prospects.",
    "The money you've lost is sunk cost. Focus on where your capital will grow best going forward.",
  ],
  short_term: [
    "Your investment horizon seems very short. Great wealth is typically built over years, not days.",
    "Consider the power of compound growth over longer time periods.",
    "Short-term trading incurs higher costs and taxes. Long-term investing often wins.",
  ],
  esg_opportunity: [
    "Sustainable investing isn't just ethical – ESG leaders often outperform over the long term.",
    "Consider diversifying into green energy. Morocco's solar potential is enormous.",
    "Your ESG score could be improved. Sustainable investments may offer both returns and impact.",
  ],
  debt_warning: [
    "Your debt level is concerning. High leverage increases risk significantly.",
    "Consider paying down debt before making new investments. Financial stability comes first.",
    "Your debt-to-income ratio is rising. This could trigger problems if markets turn.",
  ],
  diversification: [
    "Your portfolio seems concentrated. Diversification reduces risk without sacrificing returns.",
    "Consider spreading investments across sectors. Don't put all eggs in one basket.",
    "A balanced portfolio typically includes multiple sectors and asset types.",
  ],
};

export const SECTOR_COLORS: Record<string, string> = {
  banking: "#3b82f6",
  energy: "#f59e0b",
  telecom: "#8b5cf6",
  real_estate: "#ef4444",
  industry: "#6b7280",
  tech: "#06b6d4",
  agriculture: "#22c55e",
};