import { useGame } from "@/game/GameProvider";
import { useAuth } from "@/hooks/useAuth";
import { Settings, LogOut, RotateCcw, User, AlertTriangle, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SettingsTab() {
  const { state, resetGame, submitResults, submitStatus } = useGame();
  const { isAuthenticated, logout } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetGame();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Settings className="w-6 h-6 text-gray-400" />
        Settings
      </h2>

      {/* Player Info */}
      <div className="glass-panel p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          Player Profile
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Name</span>
            <span className="text-white">{state.playerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Level</span>
            <span className="text-amber-400">{state.level}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">XP</span>
            <span className="text-emerald-400">{state.xp}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Days Played</span>
            <span className="text-white">{state.day + (state.month - 1) * 30}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Bankruptcies</span>
            <span className={state.bankruptcyCount > 0 ? "text-red-400" : "text-white"}>{state.bankruptcyCount}</span>
          </div>
        </div>
      </div>

      {/* Teacher / Admin results sync */}
      <div className="glass-panel p-5">
        <h3 className="text-white font-semibold mb-2">Résultats &amp; suivi enseignant</h3>
        <p className="text-white/40 text-sm mb-4">
          Tes résultats (niveau, capital, score ESG...) sont envoyés automatiquement
          à chaque nouveau mois. Tu peux aussi forcer l'envoi ci-dessous.
        </p>
        <Button
          onClick={() => submitResults()}
          disabled={submitStatus === "saving"}
          variant="outline"
          className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
        >
          {submitStatus === "saved" ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Résultats envoyés
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {submitStatus === "saving" ? "Envoi en cours..." : "Envoyer mes résultats maintenant"}
            </>
          )}
        </Button>
        {submitStatus === "error" && (
          <p className="text-red-400 text-xs mt-2">
            L'envoi a échoué. Vérifie ta connexion et réessaie.
          </p>
        )}
      </div>

      {/* Account */}
      <div className="glass-panel p-5">
        <h3 className="text-white font-semibold mb-4">Account</h3>
        <div className="space-y-3">
          {isAuthenticated ? (
            <Button onClick={logout} variant="outline" className="w-full border-white/10 text-white/60 hover:bg-white/5 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <p className="text-white/40 text-sm">Sign in to save progress to the cloud and compete on leaderboards.</p>
          )}
        </div>
      </div>

      {/* Game Settings */}
      <div className="glass-panel p-5">
        <h3 className="text-white font-semibold mb-4">Game Management</h3>
        <div className="space-y-3">
          {!showResetConfirm ? (
            <Button
              onClick={() => setShowResetConfirm(true)}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Game Progress
            </Button>
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-semibold">Are you sure?</p>
              </div>
              <p className="text-white/50 text-sm">This will erase all your progress, including cash, portfolio, assets, and companies. This action cannot be undone.</p>
              <div className="flex gap-3">
                <Button onClick={handleReset} className="flex-1 bg-red-500 hover:bg-red-400">
                  Yes, Reset Everything
                </Button>
                <Button onClick={() => setShowResetConfirm(false)} variant="outline" className="border-white/10 text-white/60 hover:bg-white/5">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="glass-panel p-5">
        <h3 className="text-white font-semibold mb-2">About</h3>
        <p className="text-white/40 text-sm">Atlas Green Investor: Casablanca Finance Adventure v1.0</p>
        <p className="text-white/30 text-xs mt-2">
          A financial simulation game built to teach investing, behavioral finance, and sustainable investing 
          through immersive gameplay set in Morocco.
        </p>
        <p className="text-white/20 text-xs mt-4">
          Features realistic stock market simulation, loan management, ESG scoring, behavioral bias detection, 
          and entrepreneurship mechanics.
        </p>
      </div>
    </div>
  );
}
