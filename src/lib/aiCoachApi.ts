import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import {
  addRecommendation,
  addDecision,
  getAllRecommendations,
  getAllDecisions,
  deleteRecommendation,
  deleteDecision,
} from "./aiCoachStore.server";

// Reuses the same admin password check as resultsApi.ts.
function isValidAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim() || "atlas-admin-2026";
  return password === expected;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash"; // free-tier model, ~1500 requests/day

const NOURA_SYSTEM_PROMPT = `You are Noura, a friendly, intelligent, and supportive AI Behavioral Investment Coach integrated into an educational stock market simulation based on the Casablanca Stock Exchange.

Your mission is to help users become better investors, better decision makers, and more responsible citizens by encouraging thoughtful decisions aligned with Environmental, Social and Governance (ESG) principles.

You are not a financial advisor. You never tell users what they must buy or sell. You help them think — the final decision always belongs to the investor.

Be friendly, curious, positive, educational, patient, and human-like. Never criticize, shame, pressure, or manipulate.

Use nudges naturally depending on context: reminders to check information before deciding, educational notes about diversification/ESG/risk, reflective questions ("would you still be comfortable with this if the market dropped 15%?"), gentle bias-correction (loss aversion, overconfidence, herding, recency bias) without ever naming the user's mistake harshly, and positive reinforcement when the player shows good habits (comparing options, diversifying, thinking long-term).

Always respect investor autonomy, present balanced information, and explain the "why" behind a suggestion when relevant. Keep replies conversational and reasonably short (a few sentences), not a lecture.

Respond in French unless the user writes in another language.`;

// --- Shared schemas ---------------------------------------------------

const stockSummarySchema = z.object({
  symbol: z.string(),
  name: z.string(),
  sector: z.string(),
  price: z.number(),
  previousPrice: z.number(),
  trend: z.string(),
  volatility: z.number(),
  esgCategory: z.string(),
});

const newsSummarySchema = z.object({
  title: z.string(),
  description: z.string(),
  sector: z.string(),
  impactType: z.string(),
});

function buildMarketContext(data: {
  stocks: z.infer<typeof stockSummarySchema>[];
  news: z.infer<typeof newsSummarySchema>[];
  portfolioSummary: string;
  riskLevel: number;
  esgScore: number;
}): string {
  return `
Contexte de marché actuel :
Actions : ${data.stocks
    .map(
      (s) =>
        `${s.symbol} (${s.name}, secteur ${s.sector}) — ${s.price} DH, tendance ${s.trend}, volatilité ${s.volatility}, ESG ${s.esgCategory}`,
    )
    .join(" | ")}
News actives : ${
    data.news.map((n) => `${n.title} (impact ${n.impactType}, secteur ${n.sector})`).join(" | ") ||
    "aucune actualité active"
  }
Portefeuille du joueur : ${data.portfolioSummary}
Niveau de risque du joueur : ${data.riskLevel}/100
Score ESG du joueur : ${data.esgScore}/100
`;
}

// --- getAiAdvice: chat, called when the player writes to Noura ------------

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const adviceSchema = z.object({
  playerId: z.string().min(1),
  playerName: z.string().min(1),
  messages: z.array(chatMessageSchema).min(1),
  stocks: z.array(stockSummarySchema),
  news: z.array(newsSummarySchema),
  portfolioSummary: z.string(),
  riskLevel: z.number(),
  esgScore: z.number(),
});

export const getAiAdvice = createServerFn({ method: "POST" })
  .validator(adviceSchema)
  .handler(async ({ data }) => {
    const marketContext = buildMarketContext(data);

    const contents = data.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: `${NOURA_SYSTEM_PROMPT}\n\n${marketContext}`,
        maxOutputTokens: 500,
      },
    });

    const reply = response.text ?? "";

    const lastUserMessage = [...data.messages].reverse().find((m) => m.role === "user");
    const combinedText = `${lastUserMessage?.content ?? ""} ${reply}`.toLowerCase();
    const relatedStockSymbols = data.stocks
      .filter(
        (s) =>
          combinedText.includes(s.symbol.toLowerCase()) ||
          combinedText.includes(s.name.toLowerCase()),
      )
      .map((s) => s.symbol);

    await addRecommendation({
      id: crypto.randomUUID(),
      playerId: data.playerId,
      playerName: data.playerName,
      timestamp: Date.now(),
      userMessage: lastUserMessage?.content ?? "",
      aiReply: reply,
      relatedStockSymbols,
      kind: "chat",
    });

    return { reply };
  });

// --- getNudge: proactive, called automatically by NudgeCenter -------------

const nudgeSchema = z.object({
  playerId: z.string().min(1),
  playerName: z.string().min(1),
  triggerType: z.enum(["post_trade", "concentration", "news_impact", "loss_streak"]),
  contextSummary: z.string().min(1),
  relatedStockSymbols: z.array(z.string()).default([]),
  stocks: z.array(stockSummarySchema),
  news: z.array(newsSummarySchema),
  portfolioSummary: z.string(),
  riskLevel: z.number(),
  esgScore: z.number(),
});

export const getNudge = createServerFn({ method: "POST" })
  .validator(nudgeSchema)
  .handler(async ({ data }) => {
    const marketContext = buildMarketContext(data);

    const prompt = `Situation déclenchante (le joueur ne t'a rien demandé, c'est toi qui interviens proactivement) : ${data.contextSummary}

Donne UNE seule notification courte (1 à 2 phrases maximum), dans ton style habituel. Ce sera affiché comme une notification ponctuelle, pas dans une conversation — ne pose pas de question qui suppose une réponse immédiate, et ne salue pas.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `${NOURA_SYSTEM_PROMPT}\n\n${marketContext}`,
        maxOutputTokens: 150,
      },
    });

    const reply = response.text ?? "";

    await addRecommendation({
      id: crypto.randomUUID(),
      playerId: data.playerId,
      playerName: data.playerName,
      timestamp: Date.now(),
      userMessage: `[notification automatique] ${data.contextSummary}`,
      aiReply: reply,
      relatedStockSymbols: data.relatedStockSymbols,
      kind: "nudge",
      triggerType: data.triggerType,
    });

    return { message: reply };
  });

// --- logDecision: called right after a buy/sell so it's tied to the AI log

export const logDecision = createServerFn({ method: "POST" })
  .validator(
    z.object({
      playerId: z.string().min(1),
      action: z.enum(["buy", "sell"]),
      stockSymbol: z.string().min(1),
      shares: z.number(),
      price: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    await addDecision({
      id: crypto.randomUUID(),
      playerId: data.playerId,
      timestamp: Date.now(),
      action: data.action,
      stockSymbol: data.stockSymbol,
      shares: data.shares,
      price: data.price,
    });
    return { success: true as const };
  });

// --- fetchAiActivity: admin-only, raw timeline for review ------------------

export const fetchAiActivity = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    if (!isValidAdminPassword(data.password)) {
      throw new Error("Unauthorized");
    }
    const [recommendations, decisions] = await Promise.all([
      getAllRecommendations(),
      getAllDecisions(),
    ]);
    return { recommendations, decisions };
  });
  // --- deleteAiActivityEntry: admin-only, remove a single recommendation or decision

export const deleteAiActivityEntry = createServerFn({ method: "POST" })
  .validator(
    z.object({
      password: z.string(),
      id: z.string().min(1),
      kind: z.enum(["recommendation", "decision"]),
    }),
  )
  .handler(async ({ data }) => {
    if (!isValidAdminPassword(data.password)) {
      throw new Error("Unauthorized");
    }
    if (data.kind === "recommendation") {
      await deleteRecommendation(data.id);
    } else {
      await deleteDecision(data.id);
    }
    return { success: true as const };
  });