import { useGame } from "@/game/GameProvider";
import { Target, Check, Lock, Star, TrendingUp, Shield, Zap, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function MissionsTab() {
  const { state, getUnlockedMissions } = useGame();
  const missions = getUnlockedMissions();
  const completed = missions.filter((m) => m.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            Missions
          </h2>
          <p className="text-white/50 text-sm">Complete missions to earn XP and progress</p>
        </div>
        <div className="glass-panel px-4 py-2 flex items-center gap-3">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-white/40 text-xs">{completed}/{missions.length}</span>
          <Progress value={(completed / missions.length) * 100} className="w-24 h-2" />
        </div>
      </div>

      {/* Mission Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-4 text-center">
          <Award className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{completed}</p>
          <p className="text-white/40 text-xs">Completed</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{missions.length - completed}</p>
          <p className="text-white/40 text-xs">Remaining</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{state.xp}</p>
          <p className="text-white/40 text-xs">Total XP</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <Shield className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">Lv.{state.level}</p>
          <p className="text-white/40 text-xs">Level</p>
        </div>
      </div>

      {/* Mission List */}
      <div className="space-y-3">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`glass-panel p-4 flex items-center gap-4 transition-all ${
              mission.completed ? "border-emerald-500/30 bg-emerald-500/5" : ""
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              mission.completed ? "bg-emerald-500/20" : "bg-white/5"
            }`}>
              {mission.completed ? (
                <Check className="w-6 h-6 text-emerald-400" />
              ) : (
                <Lock className="w-6 h-6 text-white/30" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`font-semibold ${mission.completed ? "text-emerald-400" : "text-white"}`}>
                  {mission.title}
                </p>
                {mission.completed && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-white/50 text-sm">{mission.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 font-semibold">+{mission.reward}</span>
              </div>
              <p className="text-white/30 text-xs">XP</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="glass-panel p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Your Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-white/40 text-xs">Net Worth</p>
            <p className="text-white font-mono">{state.netWorth.toLocaleString()} MAD</p>
          </div>
          <div>
            <p className="text-white/40 text-xs">Trades</p>
            <p className="text-white font-mono">{state.tradesCount}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs">Companies</p>
            <p className="text-white font-mono">{state.activeCompanies}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs">Assets</p>
            <p className="text-white font-mono">{state.unlockedAssets.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
