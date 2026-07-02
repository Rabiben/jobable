import { useEffect, useMemo, useState } from "react";
import {
  MessageCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAiActivity, deleteAiActivityEntry } from "@/lib/aiCoachApi";

interface AiRecommendation {
  id: string;
  playerId: string;
  playerName: string;
  timestamp: number;
  userMessage: string;
  aiReply: string;
  relatedStockSymbols: string[];
  kind?: "chat" | "nudge";
  triggerType?: string;
}

interface PlayerDecision {
  id: string;
  playerId: string;
  timestamp: number;
  action: "buy" | "sell";
  stockSymbol: string;
  shares: number;
  price: number;
}

type TimelineEntry =
  | { kind: "recommendation"; timestamp: number; data: AiRecommendation }
  | { kind: "decision"; timestamp: number; data: PlayerDecision };

const TRIGGER_LABELS: Record<string, string> = {
  post_trade: "Après une transaction",
  concentration: "Concentration du portefeuille",
  news_impact: "Actualité de marché",
  loss_streak: "Série de pertes",
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// A decision "matches" a recommendation if it happened after it, mentions
// the same stock, and within a reasonable window. This is a heuristic to
// help a reviewer spot likely-related events quickly — not a hard proof of
// causation. Adjust the window to fit how your sessions are paced.
const MATCH_WINDOW_MS = 5 * 60 * 1000;

function decisionFollowsRecommendation(
  decision: PlayerDecision,
  recommendations: AiRecommendation[],
): boolean {
  return recommendations.some(
    (r) =>
      r.playerId === decision.playerId &&
      r.timestamp <= decision.timestamp &&
      decision.timestamp - r.timestamp <= MATCH_WINDOW_MS &&
      r.relatedStockSymbols.includes(decision.stockSymbol),
  );
}

export function AiActivityPanel({ password }: { password: string }) {
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [decisions, setDecisions] = useState<PlayerDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAiActivity({ data: { password } });
      setRecommendations(data.recommendations);
      setDecisions(data.decisions);
    } catch {
      setError("Impossible de charger l'activité IA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (
    id: string,
    kind: "recommendation" | "decision",
  ) => {
    const label =
      kind === "recommendation"
        ? "cette entrée d'activité IA"
        : "cette décision";
    if (!window.confirm(`Supprimer ${label} ? Cette action est irréversible.`)) {
      return;
    }

    setDeletingId(id);
    setError("");

    // Optimistic UI update
    const prevRecommendations = recommendations;
    const prevDecisions = decisions;
    if (kind === "recommendation") {
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } else {
      setDecisions((prev) => prev.filter((d) => d.id !== id));
    }

    try {
      await deleteAiActivityEntry({ data: { password, id, kind } });
    } catch {
      // Rollback if the deletion failed server-side
      setRecommendations(prevRecommendations);
      setDecisions(prevDecisions);
      setError("Impossible de supprimer cette entrée.");
    } finally {
      setDeletingId(null);
    }
  };

  const nudgeCount = recommendations.filter((r) => r.kind === "nudge").length;
  const chatCount = recommendations.length - nudgeCount;

  const byPlayer = useMemo(() => {
    const names = new Map<string, string>();
    const groups = new Map<string, TimelineEntry[]>();

    for (const r of recommendations) {
      names.set(r.playerId, r.playerName);
      const list = groups.get(r.playerId) ?? [];
      list.push({ kind: "recommendation", timestamp: r.timestamp, data: r });
      groups.set(r.playerId, list);
    }
    for (const d of decisions) {
      const list = groups.get(d.playerId) ?? [];
      list.push({ kind: "decision", timestamp: d.timestamp, data: d });
      groups.set(d.playerId, list);
    }

    return Array.from(groups.entries())
      .map(([playerId, entries]) => ({
        playerId,
        playerName: names.get(playerId) ?? playerId,
        entries: entries.sort((a, b) => b.timestamp - a.timestamp),
      }))
      .sort((a, b) => (b.entries[0]?.timestamp ?? 0) - (a.entries[0]?.timestamp ?? 0));
  }, [recommendations, decisions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">
          {chatCount} message(s) de chat · {nudgeCount} notification(s) proactive(s) ·{" "}
          {decisions.length} décision(s)
        </p>
        <Button
          onClick={load}
          variant="outline"
          size="sm"
          className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <div className="glass-panel p-4 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {!loading && byPlayer.length === 0 && !error && (
        <div className="glass-panel p-10 text-center text-white/40 text-sm">
          Aucune activité IA pour le moment.
        </div>
      )}

      {byPlayer.map((group) => (
        <div key={group.playerId} className="glass-panel p-4 space-y-3">
          <h3 className="text-white font-semibold">{group.playerName}</h3>
          <div className="space-y-2">
            {group.entries.map((entry) => {
              const isDeleting = deletingId === entry.data.id;

              if (entry.kind === "recommendation") {
                const r = entry.data;
                const isNudge = r.kind === "nudge";
                return (
                  <div
                    key={r.id}
                    className={`group flex gap-2 text-sm rounded-md -mx-2 px-2 py-1 transition-opacity hover:bg-white/[0.03] ${
                      isDeleting ? "opacity-40" : ""
                    }`}
                  >
                    {isNudge ? (
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white/40 text-xs">
                        {formatTime(r.timestamp)}
                        {isNudge && r.triggerType && (
                          <span className="ml-2 text-amber-400/80">
                            · {TRIGGER_LABELS[r.triggerType] ?? r.triggerType}
                          </span>
                        )}
                      </p>
                      {!isNudge && (
                        <p className="text-white/70">
                          <span className="text-white/40">Q : </span>
                          {r.userMessage}
                        </p>
                      )}
                      <p className="text-white/90">
                        <span className="text-white/40">{isNudge ? "Notification : " : "Noura : "}</span>
                        {r.aiReply}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, "recommendation")}
                      disabled={isDeleting}
                      title="Supprimer cette entrée"
                      className="shrink-0 self-start opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-red-400 disabled:cursor-not-allowed p-1 -m-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              const d = entry.data;
              const followed = decisionFollowsRecommendation(d, recommendations);
              const Icon = d.action === "buy" ? ArrowUpRight : ArrowDownRight;
              return (
                <div
                  key={d.id}
                  className={`group flex gap-2 text-sm rounded-md -mx-2 px-2 py-1 transition-opacity hover:bg-white/[0.03] ${
                    isDeleting ? "opacity-40" : ""
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      d.action === "buy" ? "text-emerald-400" : "text-amber-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/40 text-xs">{formatTime(d.timestamp)}</p>
                    <p className="text-white/80">
                      {d.action === "buy" ? "Achat" : "Vente"} de {d.shares} {d.stockSymbol} à{" "}
                      {d.price} DH
                      {followed && (
                        <span className="ml-2 text-xs text-indigo-400">
                          (suit un conseil récent sur ce titre)
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id, "decision")}
                    disabled={isDeleting}
                    title="Supprimer cette décision"
                    className="shrink-0 self-start opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-red-400 disabled:cursor-not-allowed p-1 -m-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}