import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useNavigate } from "@/lib/use-navigate";
import { useAuth } from "@/hooks/useAuth";
import { useGame } from "@/game/GameProvider";
import {
  Play,
  Trophy,
  HelpCircle,
  LogIn,
  LogOut,
  User,
  Leaf,
  TrendingUp,
  Building2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TitleScreen() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuth();
  const { state, initGame } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [showNewGame, setShowNewGame] = useState(false);

  const hasSavedGame = state.playerName !== "Player" || state.day > 1;

  const handleNewGame = () => {
    if (playerName.trim()) {
      initGame(playerName.trim());
      navigate("/game");
    }
  };

  const handleContinue = () => {
    navigate("/game");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/title-bg.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a]/60 to-transparent" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <span className="text-white/60 text-sm">v1.0</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 glass-panel px-3 py-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="text-white text-sm">{user?.name || "Player"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={login}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl animate-slide-in">
          {/* Logo */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Building2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="gradient-text">Atlas Green</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mt-2">
                Investor
              </h2>
              <p className="text-lg text-emerald-400/80 mt-2 font-medium tracking-wide">
                CASABLANCA FINANCE ADVENTURE
              </p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
            Begin with nothing. Master the Casablanca Stock Exchange. 
            Build wealth through sustainable investing. Your financial destiny awaits.
          </p>

          {/* Action buttons */}
          <div className="space-y-3 max-w-xs mx-auto">
            {hasSavedGame && (
              <Button
                onClick={handleContinue}
                className="w-full game-btn-gold text-lg py-6 group"
              >
                <Play className="w-5 h-5 mr-2" />
                Continue Journey
                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
            )}

            <Dialog open={showNewGame} onOpenChange={setShowNewGame}>
              <DialogTrigger asChild>
                <Button
                  className={`w-full ${hasSavedGame ? "game-btn-outline" : "game-btn text-lg py-6"}`}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {hasSavedGame ? "New Journey" : "Start Your Journey"}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0f1623] border-white/10 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl gradient-text">Create Your Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Investor Name</label>
                    <Input
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      onKeyDown={(e) => e.key === "Enter" && handleNewGame()}
                      maxLength={30}
                    />
                  </div>
                  <p className="text-white/40 text-sm">
                    You will start with 5,000 MAD in Casablanca. Apply for a loan, 
                    enter the stock market, and build your empire.
                  </p>
                  <Button
                    onClick={handleNewGame}
                    disabled={!playerName.trim()}
                    className="w-full game-btn"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Begin
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex gap-3 pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Leaderboard
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0f1623] border-white/10 text-white max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl gradient-gold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      Leaderboard
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-4">
                    {[
                      { name: "Omar Benali", worth: 1250000, level: 12, days: 180 },
                      { name: "Fatima Zahra", worth: 890000, level: 10, days: 150 },
                      { name: "Youssef Amrani", worth: 650000, level: 9, days: 120 },
                      { name: "Amina Chakir", worth: 420000, level: 7, days: 100 },
                      { name: "Karim Idrissi", worth: 280000, level: 6, days: 85 },
                    ].map((entry, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 glass-panel p-3"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          i === 0 ? "bg-amber-500/20 text-amber-400" :
                          i === 1 ? "bg-gray-400/20 text-gray-300" :
                          i === 2 ? "bg-orange-600/20 text-orange-400" :
                          "bg-white/5 text-white/50"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{entry.name}</p>
                          <p className="text-white/40 text-xs">Level {entry.level} | {entry.days} days</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-semibold">{entry.worth.toLocaleString()} MAD</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    How to Play
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0f1623] border-white/10 text-white max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl gradient-text">How to Play</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4 text-sm text-white/70">
                    <div className="glass-panel p-4 space-y-2">
                      <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Phase 1: Bank Entry
                      </h3>
                      <p>Start by applying for a loan at a Casablanca bank. Choose between low-interest, high-interest, or fast risky loans. Each has different terms and consequences.</p>
                    </div>
                    <div className="glass-panel p-4 space-y-2">
                      <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Phase 2: Stock Market
                      </h3>
                      <p>Trade stocks on the Casablanca Stock Exchange. Buy low, sell high. Watch for market events and news that affect prices.</p>
                    </div>
                    <div className="glass-panel p-4 space-y-2">
                      <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Phase 3: Behavioral Finance
                      </h3>
                      <p>Your AI coach watches your decisions and warns about biases like overconfidence, fear selling, and herd mentality.</p>
                    </div>
                    <div className="glass-panel p-4 space-y-2">
                      <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        Phase 4: ESG Investing
                      </h3>
                      <p>Invest in sustainable companies to boost your ESG score. Green investments often outperform long-term.</p>
                    </div>
                    <div className="glass-panel p-4 space-y-2">
                      <h3 className="text-emerald-400 font-semibold">Tips</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Pay your loans on time to maintain your credit score</li>
                        <li>Diversify across sectors to reduce risk</li>
                        <li>Watch for market events that create opportunities</li>
                        <li>Complete missions to earn XP and level up</li>
                        <li>Balance profit with sustainability for long-term success</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 text-white/30 text-xs space-y-2">
            <p> Atlas Green Investor. Built for Morocco's future investors.</p>
            <Link to="/admin" className="inline-block text-white/20 hover:text-white/50 transition-colors">
              Espace enseignant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
