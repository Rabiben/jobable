import { useState } from "react";
import { useGame } from "@/game/GameProvider";
import { TrendingUp, TrendingDown, Minus, Search, ShoppingCart, DollarSign, Leaf, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SECTOR_COLORS } from "@/game/constants";

export default function StockMarketTab() {
  const { state, buyStock } = useGame();
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [buyModal, setBuyModal] = useState<number | null>(null);
  const [buyShares, setBuyShares] = useState(1);

  const sectors = ["all", ...new Set(state.stocks.map((s) => s.sector))];

  const filtered = state.stocks.filter((stock) => {
    const matchSearch = stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
      stock.name.toLowerCase().includes(search.toLowerCase());
    const matchSector = sectorFilter === "all" || stock.sector === sectorFilter;
    return matchSearch && matchSector;
  });

  const handleBuy = (stockId: number) => {
    const stock = state.stocks.find((s) => s.id === stockId);
    if (stock && state.cash >= stock.price * buyShares) {
      buyStock(stockId, buyShares, stock.price);
      setBuyModal(null);
      setBuyShares(1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative h-32 rounded-xl overflow-hidden">
        <img src="/stock-market.jpg" alt="Stock Market" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Casablanca Stock Exchange
          </h2>
          <p className="text-white/60 text-sm">15 listed companies across 7 sectors</p>
        </div>
      </div>

      {/* Market Events Banner */}
      {state.marketEvents.length > 0 && (
        <div className="space-y-2">
          {state.marketEvents.slice(-2).map((event) => (
            <div
              key={event.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                event.impactType === "positive" ? "bg-emerald-500/10 border border-emerald-500/20" :
                event.impactType === "negative" ? "bg-red-500/10 border border-red-500/20" :
                "bg-amber-500/10 border border-amber-500/20"
              }`}
            >
              <Newspaper className={`w-5 h-5 flex-shrink-0 ${
                event.impactType === "positive" ? "text-emerald-400" :
                event.impactType === "negative" ? "text-red-400" :
                "text-amber-400"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{event.title}</p>
                <p className="text-white/50 text-xs truncate">{event.description}</p>
              </div>
              <Badge variant="outline" className={`flex-shrink-0 ${
                event.impactType === "positive" ? "border-emerald-500/30 text-emerald-400" :
                event.impactType === "negative" ? "border-red-500/30 text-red-400" :
                "border-amber-500/30 text-amber-400"
              }`}>
                {event.sector === "all" ? "All" : event.sector}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stocks..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => setSectorFilter(sector)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                sectorFilter === sector
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
              }`}
            >
              {sector === "all" ? "All" : sector.charAt(0).toUpperCase() + sector.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((stock) => {
          const change = ((stock.price - stock.previousPrice) / stock.previousPrice) * 100;
          const isUp = change > 0;
          const isDown = change < 0;
          const sectorColor = SECTOR_COLORS[stock.sector] || "#6b7280";

          return (
            <div key={stock.id} className="glass-panel p-4 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: `${sectorColor}30`, color: sectorColor }}
                  >
                    {stock.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{stock.symbol}</p>
                    <p className="text-white/40 text-xs">{stock.name}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  isUp ? "bg-emerald-500/20 text-emerald-400" :
                  isDown ? "bg-red-500/20 text-red-400" :
                  "bg-white/10 text-white/50"
                }`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                </div>
              </div>

              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-2xl font-bold text-white font-mono">{stock.price.toLocaleString()}</p>
                  <p className="text-white/30 text-xs">MAD</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">
                    {stock.marketCap}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="text-[10px]" style={{ borderColor: `${sectorColor}40`, color: sectorColor }}>
                  {stock.sector}
                </Badge>
                <Badge variant="outline" className={`text-[10px] ${
                  stock.esgCategory === "high" ? "border-emerald-500/30 text-emerald-400" :
                  stock.esgCategory === "medium" ? "border-amber-500/30 text-amber-400" :
                  "border-red-500/30 text-red-400"
                }`}>
                  <Leaf className="w-2 h-2 mr-1" />
                  ESG {stock.esgScore}
                </Badge>
                <Badge variant="outline" className={`text-[10px] ${
                  stock.risk > 50 ? "border-red-500/30 text-red-400" :
                  stock.risk > 30 ? "border-amber-500/30 text-amber-400" :
                  "border-emerald-500/30 text-emerald-400"
                }`}>
                  Risk {stock.risk}
                </Badge>
              </div>

              <p className="text-white/40 text-xs mb-3 line-clamp-2">{stock.description}</p>

              {buyModal === stock.id ? (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBuyShares(Math.max(1, buyShares - 1))}
                      className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={buyShares}
                      onChange={(e) => setBuyShares(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-center text-sm"
                    />
                    <button
                      onClick={() => setBuyShares(buyShares + 1)}
                      className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Total: <span className="text-white font-mono">{(stock.price * buyShares).toLocaleString()} MAD</span></span>
                    <span className={state.cash >= stock.price * buyShares ? "text-emerald-400" : "text-red-400"}>
                      {state.cash >= stock.price * buyShares ? "Affordable" : "Insufficient funds"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleBuy(stock.id)}
                      disabled={state.cash < stock.price * buyShares}
                      className="flex-1 game-btn text-sm py-2"
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Buy
                    </Button>
                    <Button
                      onClick={() => setBuyModal(null)}
                      variant="outline"
                      className="border-white/10 text-white/60 hover:bg-white/5"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => { setBuyModal(stock.id); setBuyShares(1); }}
                    disabled={state.cash < stock.price}
                    className="flex-1 game-btn text-sm py-2"
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    Buy
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
