"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameProvider";
import type { GameState, MarketEvent, Stock } from "@/game/types";

type Message = { role: "user" | "assistant"; content: string };

// ─── Data-aware helpers (inchangés) ──────────────────────────────────────────

function findMentionedStock(message: string, stocks: Stock[]): Stock | undefined {
  const lower = message.toLowerCase();
  return stocks.find(
    (s) => lower.includes(s.symbol.toLowerCase()) || lower.includes(s.name.toLowerCase())
  );
}

function describeStock(stock: Stock): string {
  const change = stock.price - stock.previousPrice;
  const changePct = stock.previousPrice ? (change / stock.previousPrice) * 100 : 0;
  const direction =
    stock.trend === "up" ? "en hausse" : stock.trend === "down" ? "en baisse" : "stable";

  let note = "";
  if (stock.volatility > 0.6) note += " Attention, ce titre est assez volatile.";
  if (stock.esgCategory === "low") note += " Son score ESG est faible.";
  if (stock.esgCategory === "high")
    note += " Son score ESG est élevé, un bon point côté investissement durable.";

  return `${stock.name} (${stock.symbol}) est à ${stock.price.toFixed(2)} DH, ${direction} (${
    changePct >= 0 ? "+" : ""
  }${changePct.toFixed(1)}% depuis la dernière séance).${note}`;
}

function describeNews(marketEvents: MarketEvent[]): string {
  const active = marketEvents.filter((e) => e.isActive);
  if (active.length === 0) return "Il n'y a pas d'actualité de marché active pour le moment.";

  const latest = active[active.length - 1];
  const impactLabel =
    latest.impactType === "positive"
      ? "positif"
      : latest.impactType === "negative"
        ? "négatif"
        : "mitigé";

  return `Dernière actu : « ${latest.title} » — ${latest.description} (impact ${impactLabel} sur le secteur ${latest.sector}).`;
}

function describePortfolio(state: GameState): string {
  if (state.portfolio.length === 0) {
    return "Tu n'as pas encore d'actions en portefeuille.";
  }

  let total = 0;
  let invested = 0;
  const lines = state.portfolio
    .map((h) => {
      const stock = state.stocks.find((s) => s.id === h.stockId);
      if (!stock) return null;
      const value = stock.price * h.shares;
      total += value;
      invested += h.totalInvested;
      const gain = value - h.totalInvested;
      const gainPct = h.totalInvested > 0 ? (gain / h.totalInvested) * 100 : 0;
      return `${stock.symbol}: ${h.shares} actions, ${value.toFixed(0)} DH (${
        gain >= 0 ? "+" : ""
      }${gainPct.toFixed(1)}%)`;
    })
    .filter(Boolean);

  const totalGain = total - invested;
  return `Ton portefeuille : ${lines.join(", ")}. Valeur totale : ${total.toFixed(0)} DH (${
    totalGain >= 0 ? "+" : ""
  }${totalGain.toFixed(0)} DH vs investi).`;
}

function describeAdvice(state: GameState): string {
  if (state.portfolio.length === 0) {
    return "Tu n'as pas encore investi. Compare plusieurs actions et leurs secteurs avant de te lancer.";
  }

  const sectors = new Set(
    state.portfolio
      .map((h) => state.stocks.find((s) => s.id === h.stockId)?.sector)
      .filter(Boolean)
  );

  if (sectors.size === 1) {
    return "Ton portefeuille est concentré sur un seul secteur — le diversifier pourrait réduire ton risque global.";
  }
  if (state.riskLevel > 70) {
    return "Ton niveau de risque global est élevé en ce moment. Assure-toi que ça correspond à ta tolérance au risque.";
  }
  return "Ton portefeuille semble raisonnablement diversifié. Continue à comparer les fondamentaux avant chaque décision.";
}

// ─── Static fallback rules (inchangées) ──────────────────────────────────────

const RULES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["bonjour", "salut", "hello", "hi"],
    reply:
      "Salut ! Demande-moi le prix d'une action, les news du marché, ou un conseil sur ton portefeuille.",
  },
  { keywords: ["merci", "bye", "au revoir"], reply: "Avec plaisir ! Reviens quand tu veux." },
];

const FALLBACK_REPLY =
  "Je peux te donner le prix d'une action (dis son nom ou son symbole), les dernières news du marché, un résumé de ton portefeuille, ou un conseil général — essaie l'un de ces mots-clés.";

function getBotReply(userMessage: string, state: GameState): string {
  const text = userMessage.toLowerCase();

  const mentionedStock = findMentionedStock(text, state.stocks);
  if (mentionedStock) return describeStock(mentionedStock);

  if (text.includes("news") || text.includes("actu")) return describeNews(state.marketEvents);

  if (text.includes("portefeuille") || text.includes("portfolio"))
    return describePortfolio(state);

  if (
    text.includes("conseil") ||
    text.includes("advice") ||
    text.includes("avis")
  )
    return describeAdvice(state);

  for (const rule of RULES) {
    if (rule.keywords.some((k) => text.includes(k))) return rule.reply;
  }

  return FALLBACK_REPLY;
}

// ─── Noura SVG logo ───────────────────────────────────────────────────────────

function NouraIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#34d399"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6l-.7 4H9l-.7-4A7 7 0 0 1 12 2z" />
      <path d="M9.5 17.5h5" />
      <path d="M10 13.5c-.8-.5-1.5-1.4-1.5-2.5a3 3 0 0 1 6 0c0 1.1-.7 2-1.5 2.5" />
      <circle cx="12" cy="21" r="1" />
    </svg>
  );
}

function NouraFabIcon({ isOpen }: { isOpen: boolean }) {
  if (isOpen) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }
  return <NouraIcon size={24} />;
}

// ─── Quick-prompt chips ───────────────────────────────────────────────────────

const QUICK_CHIPS = [
  { label: "Mon portefeuille", text: "mon portefeuille" },
  { label: "Dernières news", text: "les news du marché" },
  { label: "Un conseil", text: "donne-moi un conseil" },
];

// ─── Widget ───────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const { state } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  // Auto-focus textarea when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 120);
  }, [isOpen]);

  function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "36px";
    setIsTyping(true);

    const delay = 400 + Math.random() * 500;
    setTimeout(() => {
      const reply = getBotReply(text, state);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setIsTyping(false);
    }, delay);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "36px";
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* ── Chat panel ── */}
      {isOpen && (
        <div
          className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
          style={{ width: 380, height: 560 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-slate-900/80 px-4 py-3">
            {/* Logo */}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-slate-800">
              <NouraIcon size={16} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full border-2 border-slate-950 bg-emerald-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-400">Noura</p>
              <p className="text-[10px] text-slate-500">Coach comportemental · Bourse de Casablanca</p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le chat"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/8 hover:text-slate-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-white/10">
            {messages.length === 0 && (
              <p className="text-[12px] leading-relaxed text-slate-500">
                Essaie :{" "}
                <span className="text-emerald-500/80">« prix de {state.stocks[0]?.symbol ?? "ATW"} »</span>,{" "}
                <span className="text-emerald-500/80">« les news »</span>,{" "}
                <span className="text-emerald-500/80">« mon portefeuille »</span>,{" "}
                <span className="text-emerald-500/80">« un conseil »</span>.
              </p>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                {m.role === "assistant" && (
                  <div className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-emerald-500/25 bg-slate-800">
                    <NouraIcon size={12} />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                      : "rounded-bl-sm border border-white/8 bg-slate-800/70 text-slate-200"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-emerald-500/25 bg-slate-800">
                  <NouraIcon size={12} />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-white/8 bg-slate-800/70 px-3.5 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-slate-500"
                      style={{ animation: `pulse 1.2s ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1.5 border-t border-white/8 bg-slate-900/50 px-3 py-2">
            {QUICK_CHIPS.map((c) => (
              <button
                key={c.text}
                onClick={() => sendMessage(c.text)}
                disabled={isTyping}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] text-slate-500 transition hover:border-emerald-500/30 hover:bg-emerald-500/8 hover:text-emerald-400 disabled:opacity-40"
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-white/10 bg-slate-900/70 px-3 py-2.5">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={autoResize}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Écris un message…"
              className="flex-1 resize-none overflow-hidden rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/40 focus:outline-none"
              style={{ height: 36, maxHeight: 80 }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isTyping || !input.trim()}
              aria-label="Envoyer"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-35"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── FAB button ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat Noura"}
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-slate-900 text-emerald-400 shadow-lg transition hover:bg-slate-800 hover:scale-105 active:scale-95"
      >
        <NouraFabIcon isOpen={isOpen} />
      </button>
    </div>
  );
}