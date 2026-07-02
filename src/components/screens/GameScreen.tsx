import { useState, useEffect } from "react";
import { useGame } from "@/game/GameProvider";
import {
  LayoutDashboard,
  Landmark,
  TrendingUp,
  Wallet,
  Home,
  Building2,
  Bot,
  Target,
  Settings,
  Pause,
  Play,
  FastForward,
  SkipForward,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import DashboardTab from "@/components/game/DashboardTab";
import BankTab from "@/components/game/BankTab";
import StockMarketTab from "@/components/game/StockMarketTab";
import PortfolioTab from "@/components/game/PortfolioTab";
import AssetsTab from "@/components/game/AssetsTab";
import CompaniesTab from "@/components/game/CompaniesTab";
import CoachTab from "@/components/game/CoachTab";
import MissionsTab from "@/components/game/MissionsTab";
import SettingsTab from "@/components/game/SettingsTab";

type TabId = "dashboard" | "bank" | "market" | "portfolio" | "assets" | "companies" | "coach" | "missions" | "settings";

const TABS: { id: TabId; label: string; icon: React.ElementType; phase?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "bank", label: "Bank", icon: Landmark, phase: "bank" },
  { id: "market", label: "Stock Market", icon: TrendingUp, phase: "market" },
  { id: "portfolio", label: "Portfolio", icon: Wallet, phase: "market" },
  { id: "assets", label: "Assets", icon: Home, phase: "life" },
  { id: "companies", label: "Companies", icon: Building2, phase: "entrepreneur" },
  { id: "coach", label: "AI Coach", icon: Bot, phase: "behavioral" },
  { id: "missions", label: "Missions", icon: Target },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function GameScreen() {
  const { state, togglePause, setSpeed } = useGame();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [showBankruptAlert, setShowBankruptAlert] = useState(false);

  // Check for bankruptcy
  useEffect(() => {
    if (state.cash < -5000 && state.netWorth < 0) {
      setShowBankruptAlert(true);
    }
  }, [state.cash, state.netWorth]);

  const portfolioValue = state.portfolio.reduce((sum, h) => {
    const stock = state.stocks.find((s) => s.id === h.stockId);
    return sum + (stock ? stock.price * h.shares : 0);
  }, 0);

  const xpPercent = state.level < 15
    ? ((state.xp - [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000, 13000, 17000, 22000][state.level - 1]) /
       ([0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000, 13000, 17000, 22000][state.level] -
        [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000, 13000, 17000, 22000][state.level - 1])) * 100
    : 100;

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />;
      case "bank": return <BankTab />;
      case "market": return <StockMarketTab />;
      case "portfolio": return <PortfolioTab />;
      case "assets": return <AssetsTab />;
      case "companies": return <CompaniesTab />;
      case "coach": return <CoachTab />;
      case "missions": return <MissionsTab />;
      case "settings": return <SettingsTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col">
      {/* Bankruptcy Alert */}
      {showBankruptAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-strong p-8 max-w-md mx-4 text-center space-y-4 animate-slide-in">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-400">Bankruptcy!</h2>
            <p className="text-white/70">
              Your debts have overwhelmed you. The bank has stepped in and reset your finances. 
              Don't give up — learn from your mistakes and rebuild!
            </p>
            <Button
              onClick={() => setShowBankruptAlert(false)}
              className="game-btn"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Top HUD */}
      <header className="glass-panel-strong mx-2 mt-2 px-4 py-2 flex flex-wrap items-center gap-4 z-10">
        {/* Player Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">{state.playerName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{state.playerName}</p>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 text-xs">Lv.{state.level}</span>
              <Progress value={Math.max(0, Math.min(100, xpPercent))} className="w-16 h-1.5" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-1 flex-wrap">
          <div className="glass-panel px-3 py-1">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Cash</p>
            <p className={`font-mono font-bold text-sm ${state.cash < 0 ? "text-red-400" : "text-emerald-400"}`}>
              {state.cash.toLocaleString()} MAD
            </p>
          </div>
          <div className="glass-panel px-3 py-1">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Net Worth</p>
            <p className="font-mono font-bold text-sm text-cyan-400">
              {state.netWorth.toLocaleString()} MAD
            </p>
          </div>
          <div className="glass-panel px-3 py-1">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Portfolio</p>
            <p className="font-mono font-bold text-sm text-blue-400">
              {portfolioValue.toLocaleString()} MAD
            </p>
          </div>
          <div className="glass-panel px-3 py-1">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Debt</p>
            <p className={`font-mono font-bold text-sm ${state.debt > state.netWorth * 0.5 ? "text-red-400" : "text-white"}`}>
              {state.debt.toLocaleString()} MAD
            </p>
          </div>
          <div className="glass-panel px-3 py-1">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Credit</p>
            <p className={`font-mono font-bold text-sm ${state.creditScore > 600 ? "text-emerald-400" : state.creditScore > 400 ? "text-amber-400" : "text-red-400"}`}>
              {state.creditScore}
            </p>
          </div>
        </div>

        {/* Date & Controls */}
        <div className="flex items-center gap-2">
          <div className="glass-panel px-3 py-1 text-center">
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Date</p>
            <p className="font-mono font-bold text-sm">D{state.day}/M{state.month}/Y{state.year}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={togglePause}
          >
            {state.isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => setSpeed(1)}
          >
            <Play className={`w-4 h-4 ${state.gameSpeed === 1 && !state.isPaused ? "text-emerald-400" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => setSpeed(3)}
          >
            <FastForward className={`w-4 h-4 ${state.gameSpeed === 3 ? "text-emerald-400" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => setSpeed(5)}
          >
            <SkipForward className={`w-4 h-4 ${state.gameSpeed === 5 ? "text-emerald-400" : ""}`} />
          </Button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="mx-2 mt-2 flex gap-1 overflow-x-auto scrollbar-thin pb-1">
        {TABS.map((tab) => {
          const isLocked = tab.phase ? state.level < (tab.phase === "bank" ? 1 : tab.phase === "market" ? 1 : tab.phase === "behavioral" ? 2 : tab.phase === "esg" ? 3 : tab.phase === "life" ? 4 : 6) : false;
          return (
            <button
              key={tab.id}
              onClick={() => !isLocked && setActiveTab(tab.id)}
              disabled={isLocked}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : isLocked
                  ? "text-white/20 cursor-not-allowed"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {isLocked && <span className="text-[10px] ml-1">Lv.locked</span>}
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-2 overflow-y-auto scrollbar-thin">
        <div className="animate-fade-in">
          {renderTab()}
        </div>
      </main>
    </div>
  );
}
