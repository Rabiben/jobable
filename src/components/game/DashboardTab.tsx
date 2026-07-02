import { useGame } from "@/game/GameProvider";
import { TrendingUp, TrendingDown, Leaf, AlertTriangle, Shield, Zap, Building2, Target, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DashboardTab() {
  const { state } = useGame();

  const portfolioValue = state.portfolio.reduce((sum, h) => {
    const stock = state.stocks.find((s) => s.id === h.stockId);
    return sum + (stock ? stock.price * h.shares : 0);
  }, 0);

  const assetValue = state.assets.reduce((sum, a) => sum + a.cost * 0.7, 0);
  const companyValue = state.companies.reduce((sum, c) => sum + c.valuation * (c.playerShares / (c.totalShares || 1)), 0);

  const topGainers = [...state.stocks]
    .map((s) => ({ ...s, change: ((s.price - s.previousPrice) / s.previousPrice) * 100 }))
    .sort((a, b) => b.change - a.change)
    .slice(0, 3);

  const topLosers = [...state.stocks]
    .map((s) => ({ ...s, change: ((s.price - s.previousPrice) / s.previousPrice) * 100 }))
    .sort((a, b) => a.change - b.change)
    .slice(0, 3);

  // Recent missions tracking available via state.completedMissions

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-white/50 text-xs">Cash</span>
          </div>
          <p className={`text-xl font-bold font-mono ${state.cash < 0 ? "text-red-400" : "text-white"}`}>
            {state.cash.toLocaleString()}
          </p>
          <p className="text-white/30 text-[10px]">MAD</p>
        </div>

        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-white/50 text-xs">Net Worth</span>
          </div>
          <p className="text-xl font-bold font-mono text-white">{state.netWorth.toLocaleString()}</p>
          <p className="text-white/30 text-[10px]">MAD</p>
        </div>

        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-white/50 text-xs">Portfolio</span>
          </div>
          <p className="text-xl font-bold font-mono text-white">{portfolioValue.toLocaleString()}</p>
          <p className="text-white/30 text-[10px]">MAD</p>
        </div>

        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-white/50 text-xs">Level {state.level}</span>
          </div>
          <Progress value={(state.xp % 100)} className="h-2" />
          <p className="text-white/30 text-[10px]">{state.xp} XP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Financial Health */}
          <div className="glass-panel p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Financial Health
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">Credit Score</span>
                  <span className={state.creditScore > 600 ? "text-emerald-400" : state.creditScore > 400 ? "text-amber-400" : "text-red-400"}>
                    {state.creditScore}/850
                  </span>
                </div>
                <Progress value={(state.creditScore / 850) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">ESG Score</span>
                  <span className={state.esgScore > 70 ? "text-emerald-400" : "text-amber-400"}>{state.esgScore}/100</span>
                </div>
                <Progress value={state.esgScore} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">Risk Level</span>
                  <span className={state.riskLevel > 70 ? "text-red-400" : state.riskLevel > 40 ? "text-amber-400" : "text-emerald-400"}>
                    {state.riskLevel}%
                  </span>
                </div>
                <Progress value={state.riskLevel} className="h-2 bg-red-900/20" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">Debt Ratio</span>
                  <span className={state.debt > state.netWorth * 0.5 ? "text-red-400" : "text-emerald-400"}>
                    {state.netWorth > 0 ? ((state.debt / state.netWorth) * 100).toFixed(1) : "0"}%
                  </span>
                </div>
                <Progress value={state.netWorth > 0 ? (state.debt / state.netWorth) * 100 : 0} className="h-2 bg-red-900/20" />
              </div>
            </div>
          </div>

          {/* Asset Breakdown */}
          <div className="glass-panel p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Asset Breakdown
            </h3>
            <div className="space-y-2">
              {[
                { label: "Cash", value: state.cash, color: "bg-emerald-500" },
                { label: "Portfolio", value: portfolioValue, color: "bg-blue-500" },
                { label: "Assets", value: assetValue, color: "bg-purple-500" },
                { label: "Companies", value: companyValue, color: "bg-amber-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-white/60 text-sm flex-1">{item.label}</span>
                  <span className="text-white font-mono text-sm">{item.value.toLocaleString()} MAD</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - Market */}
        <div className="space-y-4">
          {/* Market Movers */}
          <div className="glass-panel p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Top Gainers
            </h3>
            <div className="space-y-2">
              {topGainers.map((stock) => (
                <div key={stock.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-white text-sm font-medium">{stock.symbol}</p>
                    <p className="text-white/40 text-xs">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-mono text-sm font-semibold">+{stock.change.toFixed(2)}%</p>
                    <p className="text-white/40 text-xs">{stock.price} MAD</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              Top Losers
            </h3>
            <div className="space-y-2">
              {topLosers.map((stock) => (
                <div key={stock.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-white text-sm font-medium">{stock.symbol}</p>
                    <p className="text-white/40 text-xs">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-mono text-sm font-semibold">{stock.change.toFixed(2)}%</p>
                    <p className="text-white/40 text-xs">{stock.price} MAD</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Insights */}
          {state.behavioralInsights.length > 0 && (
            <div className="glass-panel p-4 border-amber-500/20">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-amber-400" />
                Recent Insights
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
                {state.behavioralInsights.slice(-3).map((insight, i) => (
                  <div key={i} className="text-amber-400/80 text-xs p-2 bg-amber-500/5 rounded-lg">
                    {insight.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Market Events */}
          {state.marketEvents.length > 0 && (
            <div className="glass-panel p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Market News
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                {state.marketEvents.slice(-5).map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg ${
                      event.impactType === "positive" ? "bg-emerald-500/10 border border-emerald-500/20" :
                      event.impactType === "negative" ? "bg-red-500/10 border border-red-500/20" :
                      "bg-amber-500/10 border border-amber-500/20"
                    }`}
                  >
                    <p className="text-white text-sm font-medium">{event.title}</p>
                    <p className="text-white/50 text-xs mt-1">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Missions */}
          <div className="glass-panel p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Missions</span>
                <span className="text-emerald-400">{state.completedMissions.length}/10</span>
              </div>
              <Progress value={(state.completedMissions.length / 10) * 100} className="h-2" />
              <div className="flex justify-between text-xs mt-2">
                <span className="text-white/50">Assets</span>
                <span className="text-emerald-400">{state.unlockedAssets.length}/5</span>
              </div>
              <Progress value={(state.unlockedAssets.length / 5) * 100} className="h-2" />
              <div className="flex justify-between text-xs mt-2">
                <span className="text-white/50">Companies</span>
                <span className="text-emerald-400">{state.activeCompanies}</span>
              </div>
            </div>
          </div>

          {/* Active Loans */}
          {state.loans.filter((l) => !l.isPaidOff).length > 0 && (
            <div className="glass-panel p-4">
              <h3 className="text-white font-semibold mb-3">Active Loans</h3>
              <div className="space-y-2">
                {state.loans.filter((l) => !l.isPaidOff).map((loan) => (
                  <div key={loan.id} className="flex justify-between text-sm">
                    <span className="text-white/60">{loan.type.replace("_", " ")}</span>
                    <span className="text-amber-400 font-mono">{loan.remainingBalance.toLocaleString()} MAD</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
