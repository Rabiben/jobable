import { useState } from "react";
import { useGame } from "@/game/GameProvider";
import { Building2, Users, TrendingUp, DollarSign, Lock, Rocket, BarChart3, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SECTOR_COLORS } from "@/game/constants";

const SECTORS = ["banking", "energy", "telecom", "real_estate", "industry", "tech", "agriculture"];

export default function CompaniesTab() {
  const { state, createCompany, goPublic } = useGame();
  const [showCreate, setShowCreate] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [selectedSector, setSelectedSector] = useState("tech");

  const unlocked = state.level >= 6;

  const handleCreate = () => {
    if (companyName.trim() && state.cash >= 50000) {
      createCompany(companyName.trim(), selectedSector);
      setShowCreate(false);
      setCompanyName("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            Entrepreneurship
          </h2>
          <p className="text-white/50 text-sm">Create and grow your own companies</p>
        </div>
        {unlocked && (
          <Button onClick={() => setShowCreate(true)} className="game-btn-gold">
            <Rocket className="w-4 h-4 mr-2" />
            New Company
          </Button>
        )}
      </div>

      {!unlocked ? (
        <div className="glass-panel p-12 text-center">
          <Lock className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <p className="text-white/40 text-lg">Entrepreneurship unlocks at Level 6</p>
          <p className="text-white/30 text-sm mt-2">Continue investing and completing missions to level up</p>
          <p className="text-amber-400 text-sm mt-4">Current Level: {state.level}</p>
        </div>
      ) : (
        <>
          {/* Create Company Form */}
          {showCreate && (
            <div className="glass-panel p-6 animate-fade-in">
              <h3 className="text-white font-semibold mb-4">Create a New Company</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Company Name</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Sector</label>
                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map((sector) => {
                      const color = SECTOR_COLORS[sector] || "#6b7280";
                      return (
                        <button
                          key={sector}
                          onClick={() => setSelectedSector(sector)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                            selectedSector === sector
                              ? "border-2"
                              : "border border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                          }`}
                          style={selectedSector === sector ? { borderColor: color, color, backgroundColor: `${color}15` } : {}}
                        >
                          {sector.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-amber-400 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Startup Cost: 50,000 MAD (minimum)
                  </p>
                  <p className="text-white/40 text-xs mt-1">Monthly operating costs: 3,000 MAD</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleCreate} disabled={!companyName.trim() || state.cash < 50000} className="game-btn">
                    Create Company
                  </Button>
                  <Button onClick={() => setShowCreate(false)} variant="outline" className="border-white/10 text-white/60 hover:bg-white/5">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Company List */}
          {state.companies.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto text-white/20 mb-4" />
              <p className="text-white/40 text-lg">No companies yet</p>
              <p className="text-white/30 text-sm mt-2">Create your first company to start generating revenue</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.companies.map((company) => {
                const sectorColor = SECTOR_COLORS[company.sector] || "#6b7280";
                return (
                  <div key={company.id} className="glass-panel p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${sectorColor}20` }}
                        >
                          <Building2 className="w-6 h-6" style={{ color: sectorColor }} />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{company.name}</p>
                          <p className="text-white/40 text-xs capitalize">{company.sector.replace("_", " ")}</p>
                        </div>
                      </div>
                      {company.isPublic ? (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">
                          Public
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-white/10 text-white/40 text-xs rounded-full font-medium">
                          Private
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-white/40 text-xs">Valuation</p>
                        <p className="text-white font-mono font-semibold">{company.valuation.toLocaleString()} MAD</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Employees</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-400" />
                          {company.employees}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Revenue</p>
                        <p className="text-emerald-400 font-mono">{company.revenue.toLocaleString()} MAD</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">Monthly Cost</p>
                        <p className="text-red-400 font-mono">{company.monthlyCosts.toLocaleString()} MAD</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-3 h-3 text-emerald-400" />
                        <span className="text-white/40 text-xs">ESG Rating</span>
                        <span className="text-emerald-400 text-xs font-semibold">{company.esgRating}/100</span>
                      </div>
                      {company.isPublic && (
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-3 h-3 text-blue-400" />
                          <span className="text-white/40 text-xs">Share Price</span>
                          <span className="text-blue-400 text-xs font-semibold">{company.sharePrice} MAD</span>
                        </div>
                      )}
                    </div>

                    {!company.isPublic && (
                      <Button
                        onClick={() => goPublic(company.id)}
                        className="w-full game-btn text-sm"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Go Public (IPO)
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
