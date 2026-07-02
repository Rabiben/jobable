import { useState } from "react";
import { useGame } from "@/game/GameProvider";
import { Wallet, TrendingDown, DollarSign, PieChart, Leaf, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SECTOR_COLORS } from "@/game/constants";

export default function PortfolioTab() {
  const { state, sellStock } = useGame();
  const [sellModal, setSellModal] = useState<number | null>(null);
  const [sellShares, setSellShares] = useState(1);

  const portfolioValue = state.portfolio.reduce((sum, h) => {
    const stock = state.stocks.find((s) => s.id === h.stockId);
    return sum + (stock ? stock.price * h.shares : 0);
  }, 0);

  const totalInvested = state.portfolio.reduce((sum, h) => sum + h.totalInvested, 0);
  const totalPnl = portfolioValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  // Sector breakdown
  const sectorValues: Record<string, number> = {};
  state.portfolio.forEach((h) => {
    const stock = state.stocks.find((s) => s.id === h.stockId);
    if (stock) {
      sectorValues[stock.sector] = (sectorValues[stock.sector] || 0) + stock.price * h.shares;
    }
  });

  const handleSell = (stockId: number) => {
    const stock = state.stocks.find((s) => s.id === stockId);
    const holding = state.portfolio.find((h) => h.stockId === stockId);
    if (stock && holding && holding.shares >= sellShares) {
      sellStock(stockId, sellShares, stock.price);
      setSellModal(null);
      setSellShares(1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-4">
          <p className="text-white/40 text-xs uppercase">Portfolio Value</p>
          <p className="text-xl font-bold text-white font-mono">{portfolioValue.toLocaleString()}</p>
          <p className="text-white/30 text-[10px]">MAD</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-white/40 text-xs uppercase">Total Invested</p>
          <p className="text-xl font-bold text-white font-mono">{totalInvested.toLocaleString()}</p>
          <p className="text-white/30 text-[10px]">MAD</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-white/40 text-xs uppercase">P&L</p>
          <p className={`text-xl font-bold font-mono ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {totalPnl >= 0 ? "+" : ""}{totalPnl.toLocaleString()}
          </p>
          <p className={`text-[10px] ${totalPnl >= 0 ? "text-emerald-400/60" : "text-red-400/60"}`}>
            {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
          </p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-white/40 text-xs uppercase">Holdings</p>
          <p className="text-xl font-bold text-white font-mono">{state.portfolio.length}</p>
          <p className="text-white/30 text-[10px]">stocks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Holdings */}
        <div className="lg:col-span-2 space-y-3">
          {state.portfolio.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <Wallet className="w-16 h-16 mx-auto text-white/20 mb-4" />
              <p className="text-white/40 text-lg">Your portfolio is empty</p>
              <p className="text-white/30 text-sm mt-2">Buy stocks from the market to start building your portfolio</p>
            </div>
          ) : (
            state.portfolio.map((holding) => {
              const stock = state.stocks.find((s) => s.id === holding.stockId);
              if (!stock) return null;

              const currentValue = stock.price * holding.shares;
              const pnl = currentValue - holding.totalInvested;
              const pnlPct = holding.totalInvested > 0 ? (pnl / holding.totalInvested) * 100 : 0;
              const sectorColor = SECTOR_COLORS[stock.sector] || "#6b7280";

              return (
                <div key={holding.stockId} className="glass-panel p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: `${sectorColor}30` }}
                      >
                        <span style={{ color: sectorColor }}>{stock.symbol}</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{stock.name}</p>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <span>{holding.shares} shares</span>
                          <span>@ {holding.avgBuyPrice.toLocaleString()} MAD avg</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold font-mono">{currentValue.toLocaleString()} MAD</p>
                      <p className={`text-xs font-semibold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {pnl >= 0 ? "+" : ""}{pnl.toLocaleString()} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/40">
                      Current: {stock.price.toLocaleString()} MAD
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/40">
                      Day Change: {((stock.price - stock.previousPrice) / stock.previousPrice * 100).toFixed(2)}%
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-emerald-400/60">
                      <Leaf className="w-2 h-2 inline mr-1" />
                      ESG: {stock.esgScore}
                    </span>
                  </div>

                  {sellModal === holding.stockId ? (
                    <div className="mt-3 space-y-2 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSellShares(Math.max(1, sellShares - 1))}
                          className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={sellShares}
                          onChange={(e) => setSellShares(Math.max(1, Math.min(holding.shares, parseInt(e.target.value) || 1)))}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-center text-sm"
                        />
                        <button
                          onClick={() => setSellShares(holding.shares)}
                          className="px-3 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 text-xs"
                        >
                          MAX
                        </button>
                        <button
                          onClick={() => setSellShares(Math.min(holding.shares, sellShares + 1))}
                          className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">Proceeds: <span className="text-emerald-400 font-mono">{(stock.price * sellShares).toLocaleString()} MAD</span></span>
                        <span className="text-white/50">Gain: <span className={stock.price * sellShares - holding.avgBuyPrice * sellShares >= 0 ? "text-emerald-400" : "text-red-400"}>
                          {stock.price * sellShares - holding.avgBuyPrice * sellShares >= 0 ? "+" : ""}
                          {(stock.price * sellShares - holding.avgBuyPrice * sellShares).toLocaleString()} MAD
                        </span></span>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSell(holding.stockId)} className="flex-1 bg-red-500 hover:bg-red-400 text-sm py-2">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Sell {sellShares} shares
                        </Button>
                        <Button onClick={() => setSellModal(null)} variant="outline" className="border-white/10 text-white/60 hover:bg-white/5">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => { setSellModal(holding.stockId); setSellShares(1); }}
                      variant="outline"
                      className="mt-3 border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm"
                    >
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Sell
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Sector Allocation */}
          {Object.keys(sectorValues).length > 0 && (
            <div className="glass-panel p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                Sector Allocation
              </h3>
              <div className="space-y-2">
                {Object.entries(sectorValues).map(([sector, value]) => {
                  const pct = portfolioValue > 0 ? (value / portfolioValue) * 100 : 0;
                  const color = SECTOR_COLORS[sector] || "#6b7280";
                  return (
                    <div key={sector}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60 capitalize">{sector.replace("_", " ")}</span>
                        <span className="text-white/40">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ESG Breakdown */}
          <div className="glass-panel p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Portfolio ESG
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 font-bold">{state.esgScore}</span>
              </div>
              <div className="flex-1">
                <Progress value={state.esgScore} className="h-2" />
                <p className="text-white/30 text-xs mt-1">
                  {state.esgScore >= 80 ? "ESG Champion" : state.esgScore >= 60 ? "Sustainable" : state.esgScore >= 40 ? "Average" : "Needs Improvement"}
                </p>
              </div>
            </div>
            <div className="space-y-1 text-xs">
              {state.portfolio.map((h) => {
                const stock = state.stocks.find((s) => s.id === h.stockId);
                if (!stock) return null;
                return (
                  <div key={h.stockId} className="flex justify-between">
                    <span className="text-white/40">{stock.symbol}</span>
                    <span className={stock.esgScore >= 70 ? "text-emerald-400" : stock.esgScore >= 50 ? "text-amber-400" : "text-red-400"}>
                      ESG {stock.esgScore}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Warning */}
          {state.riskLevel > 60 && (
            <div className="glass-panel p-4 border-red-500/20">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold text-sm">High Risk Alert</span>
              </div>
              <p className="text-white/50 text-xs">
                Your portfolio risk level is {state.riskLevel}%. Consider diversifying into lower-risk sectors or reducing leverage.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
