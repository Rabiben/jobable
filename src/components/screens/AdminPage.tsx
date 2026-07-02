import { useEffect, useMemo, useState } from "react";
import {
  Lock,
  RefreshCw,
  LogOut,
  Users,
  TrendingUp,
  Leaf,
  AlertTriangle,
  Trash2,
  Download,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminLogin,
  fetchAllResults,
  deleteGameResult,
} from "@/lib/resultsApi";
import { AiActivityPanel } from "./AiActivityPanel";
interface PlayerResult {
  playerId: string;
  playerName: string;
  level: number;
  xp: number;
  cash: number;
  debt: number;
  netWorth: number;
  portfolioValue: number;
  creditScore: number;
  esgScore: number;
  riskLevel: number;
  totalProfit: number;
  totalLoss: number;
  tradesCount: number;
  bankruptcyCount: number;
  day: number;
  month: number;
  year: number;
  daysPlayed: number;
  companiesCreated: number;
  assetsOwned: number;
  completedMissions: number;
  submittedAt: number;
}

const TOKEN_KEY = "atlas_admin_token";
type SortKey = keyof Pick<
  PlayerResult,
  "playerName" | "netWorth" | "level" | "esgScore" | "creditScore" | "daysPlayed" | "submittedAt"
>;

function formatNumber(n: number) {
  return n.toLocaleString("fr-FR");
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LoginGate({ onSuccess }: { onSuccess: (password: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminLogin({ data: { password } });
      if (res.success) {
        sessionStorage.setItem(TOKEN_KEY, password);
        onSuccess(password);
      } else {
        setError("Mot de passe incorrect.");
      }
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="glass-panel-strong w-full max-w-sm p-8 space-y-5"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Espace enseignant</h1>
            <p className="text-white/40 text-sm mt-1">
              Entre le mot de passe administrateur pour voir les résultats des joueurs.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
        <Button type="submit" disabled={loading || !password} className="w-full game-btn">
          {loading ? "Vérification..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="glass-panel p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-white/40 text-[11px] uppercase tracking-wider">{label}</p>
        <p className="text-white font-mono font-bold text-lg leading-tight">{value}</p>
      </div>
    </div>
  );
}

function Dashboard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("netWorth");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [tab, setTab] = useState<"results" | "ai">("results");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllResults({ data: { password } });
      setResults(data as PlayerResult[]);
    } catch {
      setError("Impossible de charger les résultats. Session expirée ?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (playerId: string) => {
    if (!confirm("Supprimer ce résultat ?")) return;
    try {
      await deleteGameResult({ data: { password, playerId } });
      setResults((prev) => prev.filter((r) => r.playerId !== playerId));
    } catch {
      alert("Suppression impossible.");
    }
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? results.filter((r) => r.playerName.toLowerCase().includes(term))
      : results;
    const sorted = [...list].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
    });
    return sorted;
  }, [results, search, sortKey, sortDir]);

  const stats = useMemo(() => {
    if (results.length === 0) {
      return { count: 0, avgNetWorth: 0, avgEsg: 0, bankruptcies: 0 };
    }
    const count = results.length;
    const avgNetWorth = Math.round(
      results.reduce((s, r) => s + r.netWorth, 0) / count,
    );
    const avgEsg = Math.round(results.reduce((s, r) => s + r.esgScore, 0) / count);
    const bankruptcies = results.reduce((s, r) => s + r.bankruptcyCount, 0);
    return { count, avgNetWorth, avgEsg, bankruptcies };
  }, [results]);

  const handleExportCsv = () => {
    const headers = [
      "Nom",
      "Niveau",
      "Valeur nette (MAD)",
      "Cash (MAD)",
      "Dette (MAD)",
      "Score ESG",
      "Crédit",
      "Trades",
      "Faillites",
      "Jours joués",
      "Dernier envoi",
    ];
    const rows = filtered.map((r) => [
      r.playerName,
      r.level,
      r.netWorth,
      r.cash,
      r.debt,
      r.esgScore,
      r.creditScore,
      r.tradesCount,
      r.bankruptcyCount,
      r.daysPlayed,
      formatDate(r.submittedAt),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atlas-resultats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => handleSort(sortKeyName)}
      className="flex items-center gap-1 text-white/60 hover:text-white text-xs uppercase tracking-wider"
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortKey === sortKeyName ? "text-emerald-400" : ""}`} />
    </button>
  );

  return (
   <div className="min-h-screen bg-[#0a0f1a] text-white p-4 md:p-6 space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Espace enseignant</h1>
          <p className="text-white/40 text-sm">Résultats de tous les joueurs d'Atlas Green Investor</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={load}
            variant="outline"
            size="sm"
            className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            onClick={handleExportCsv}
            variant="outline"
            size="sm"
            className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
            disabled={filtered.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="flex gap-2">
        <Button
          onClick={() => setTab("results")}
          variant={tab === "results" ? "default" : "outline"}
          size="sm"
        >
          Résultats
        </Button>
        <Button
          onClick={() => setTab("ai")}
          variant={tab === "ai" ? "default" : "outline"}
          size="sm"
        >
          Activité IA
        </Button>
      </div>

      {tab === "results" ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={Users}
              label="Joueurs"
              value={String(stats.count)}
              accent="bg-blue-500/20 text-blue-400"
            />
            <StatCard
              icon={TrendingUp}
              label="Valeur nette moy."
              value={`${formatNumber(stats.avgNetWorth)} MAD`}
              accent="bg-emerald-500/20 text-emerald-400"
            />
            <StatCard
              icon={Leaf}
              label="Score ESG moy."
              value={String(stats.avgEsg)}
              accent="bg-teal-500/20 text-teal-400"
            />
            <StatCard
              icon={AlertTriangle}
              label="Faillites totales"
              value={String(stats.bankruptcies)}
              accent="bg-red-500/20 text-red-400"
            />
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un joueur..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          {error && (
            <div className="glass-panel p-4 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="glass-panel overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead><SortHeader label="Joueur" sortKeyName="playerName" /></TableHead>
                  <TableHead><SortHeader label="Niveau" sortKeyName="level" /></TableHead>
                  <TableHead><SortHeader label="Valeur nette" sortKeyName="netWorth" /></TableHead>
                  <TableHead className="text-white/60 text-xs uppercase tracking-wider">Cash</TableHead>
                  <TableHead className="text-white/60 text-xs uppercase tracking-wider">Dette</TableHead>
                  <TableHead><SortHeader label="ESG" sortKeyName="esgScore" /></TableHead>
                  <TableHead><SortHeader label="Crédit" sortKeyName="creditScore" /></TableHead>
                  <TableHead className="text-white/60 text-xs uppercase tracking-wider">Trades</TableHead>
                  <TableHead className="text-white/60 text-xs uppercase tracking-wider">Faillites</TableHead>
                  <TableHead><SortHeader label="Jours" sortKeyName="daysPlayed" /></TableHead>
                  <TableHead><SortHeader label="Dernier envoi" sortKeyName="submittedAt" /></TableHead>
                  <TableHead className="text-white/60 text-xs uppercase tracking-wider"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && !loading && (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={12} className="text-center text-white/40 py-10">
                      Aucun résultat pour le moment. Les résultats apparaissent ici dès
                      qu'un joueur lance une partie.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((r) => (
                  <TableRow key={r.playerId} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{r.playerName}</TableCell>
                    <TableCell className="text-amber-400">Lv.{r.level}</TableCell>
                    <TableCell className={`font-mono ${r.netWorth < 0 ? "text-red-400" : "text-cyan-400"}`}>
                      {formatNumber(r.netWorth)} MAD
                    </TableCell>
                    <TableCell className={`font-mono ${r.cash < 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {formatNumber(r.cash)} MAD
                    </TableCell>
                    <TableCell className="font-mono text-white/70">{formatNumber(r.debt)} MAD</TableCell>
                    <TableCell className="text-teal-400">{r.esgScore}</TableCell>
                    <TableCell
                      className={
                        r.creditScore > 600
                          ? "text-emerald-400"
                          : r.creditScore > 400
                          ? "text-amber-400"
                          : "text-red-400"
                      }
                    >
                      {r.creditScore}
                    </TableCell>
                    <TableCell className="text-white/70">{r.tradesCount}</TableCell>
                    <TableCell className={r.bankruptcyCount > 0 ? "text-red-400" : "text-white/70"}>
                      {r.bankruptcyCount}
                    </TableCell>
                    <TableCell className="text-white/70">{r.daysPlayed}</TableCell>
                    <TableCell className="text-white/40 text-xs whitespace-nowrap">
                      {formatDate(r.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleDelete(r.playerId)}
                        variant="ghost"
                        size="icon"
                        className="text-white/30 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <AiActivityPanel password={password} />
      )}
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    setToken(stored);
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!token) {
    return <LoginGate onSuccess={(password) => setToken(password)} />;
  }

  return (
    <Dashboard
      password={token}
      onLogout={() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }}
    />
  );
}