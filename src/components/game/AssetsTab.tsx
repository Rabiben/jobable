import { useGame } from "@/game/GameProvider";
import { Home, Car, Building2, Zap, Rocket, Lock, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";


const ASSET_ICON_MAP: Record<string, React.ElementType> = {
  apartment: Home,
  car: Car,
  company: Building2,
  renewable_energy: Zap,
  startup: Rocket,
};

export default function AssetsTab() {
  const { state, purchaseAsset, getAvailableAssets } = useGame();
  const availableAssets = getAvailableAssets();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-purple-400" />
            Life Assets
          </h2>
          <p className="text-white/50 text-sm">Unlock assets as you progress through levels</p>
        </div>
        <div className="glass-panel px-4 py-2">
          <span className="text-white/40 text-xs">Unlocked: </span>
          <span className="text-emerald-400 font-bold">{state.unlockedAssets.length}/5</span>
        </div>
      </div>

      {/* Owned Assets */}
      {state.assets.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Your Assets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {state.assets.map((asset) => {
              const Icon = ASSET_ICON_MAP[asset.type] || Home;
              return (
                <div key={asset.id} className="glass-panel p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{asset.name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: asset.prestigeLevel }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-white/40 text-xs">Value</p>
                      <p className="text-white font-mono">{asset.cost.toLocaleString()} MAD</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Monthly</p>
                      <p className={asset.monthlyIncome > 0 ? "text-emerald-400" : "text-red-400"}>
                        {asset.monthlyIncome > 0 ? "+" : ""}
                        {(asset.monthlyIncome - asset.monthlyExpense).toLocaleString()} MAD
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">ESG Impact</p>
                      <p className={asset.esgImpact >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {asset.esgImpact >= 0 ? "+" : ""}{asset.esgImpact}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Risk</p>
                      <p className={asset.riskImpact > 0 ? "text-red-400" : "text-emerald-400"}>
                        {asset.riskImpact > 0 ? "+" : ""}{asset.riskImpact}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Assets */}
      <div>
        <h3 className="text-white font-semibold mb-3">Available to Unlock</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableAssets.map((asset) => {
            const Icon = ASSET_ICON_MAP[asset.type] || Home;
            const canAfford = state.cash >= asset.cost;
            const atRequiredLevel = state.level >= asset.requiredLevel;

            return (
              <div key={asset.type} className={`glass-panel p-4 ${!atRequiredLevel ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    atRequiredLevel ? "bg-purple-500/20" : "bg-white/5"
                  }`}>
                    {atRequiredLevel ? (
                      <Icon className="w-6 h-6 text-purple-400" />
                    ) : (
                      <Lock className="w-6 h-6 text-white/30" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{asset.name}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: asset.prestigeLevel }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400/40" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-white/50 text-sm mb-3">{asset.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <p className="text-white/40">Cost</p>
                    <p className="text-white font-mono">{asset.cost.toLocaleString()} MAD</p>
                  </div>
                  <div>
                    <p className="text-white/40">Net Monthly</p>
                    <p className={asset.monthlyIncome - asset.monthlyExpense >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {(asset.monthlyIncome - asset.monthlyExpense).toLocaleString()} MAD
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40">ESG</p>
                    <p className="text-emerald-400">+{asset.esgImpact}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Required Level</p>
                    <p className={state.level >= asset.requiredLevel ? "text-emerald-400" : "text-amber-400"}>
                      {asset.requiredLevel}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => purchaseAsset(asset.type)}
                  disabled={!canAfford || !atRequiredLevel}
                  className="w-full game-btn text-sm py-2"
                >
                  {atRequiredLevel ? (
                    canAfford ? "Purchase" : "Insufficient Funds"
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Level {asset.requiredLevel} Required
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
