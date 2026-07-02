import { useGame } from "@/game/GameProvider";
import { Bot, Brain, TrendingUp, AlertTriangle, Leaf, Lightbulb, MessageSquare, Lock } from "lucide-react";

const BIAS_EXPLANATIONS: Record<string, { title: string; description: string; icon: React.ElementType; color: string }> = {
  overconfidence: {
    title: "Overconfidence Bias",
    description: "You may be trading too frequently, believing you can predict market movements better than you actually can. Studies show that frequent traders typically underperform buy-and-hold investors.",
    icon: TrendingUp,
    color: "text-amber-400",
  },
  fear_selling: {
    title: "Fear-Based Selling",
    description: "Selling during market downturns locks in losses. Quality investments usually recover over time. Consider whether your decisions are based on fundamentals or emotions.",
    icon: AlertTriangle,
    color: "text-red-400",
  },
  herd_mentality: {
    title: "Herd Mentality",
    description: "Following the crowd into popular investments often leads to buying at peak prices. Independent analysis typically produces better long-term results.",
    icon: Brain,
    color: "text-purple-400",
  },
  loss_aversion: {
    title: "Loss Aversion",
    description: "Holding onto losing investments too long, hoping to 'break even.' Remember: sunk costs shouldn't influence future decisions. Focus on where capital will grow best.",
    icon: Lock,
    color: "text-orange-400",
  },
  short_term: {
    title: "Short-Term Thinking",
    description: "Great wealth is typically built over years, not days. Short-term trading incurs higher costs and taxes. Consider the power of compound growth.",
    icon: TrendingUp,
    color: "text-blue-400",
  },
  debt_warning: {
    title: "High Leverage Risk",
    description: "Your debt levels are concerning. High leverage amplifies both gains and losses. Consider reducing debt before making new investments.",
    icon: AlertTriangle,
    color: "text-red-400",
  },
  esg_opportunity: {
    title: "ESG Opportunity",
    description: "Sustainable investing isn't just ethical – ESG leaders often outperform over the long term. Morocco's green energy sector offers significant growth potential.",
    icon: Leaf,
    color: "text-emerald-400",
  },
  diversification: {
    title: "Diversification Needed",
    description: "Your portfolio seems concentrated. Spreading investments across sectors reduces risk without necessarily sacrificing returns.",
    icon: Brain,
    color: "text-cyan-400",
  },
};

export default function CoachTab() {
  const { state } = useGame();
  const unlocked = state.level >= 2;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-panel p-6 flex items-center gap-6">
        <div className="w-20 h-20 flex-shrink-0">
          <img src="/atlas-coach.png" alt="Atlas AI Coach" className="w-full h-full object-contain" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-400" />
            Atlas AI Coach
          </h2>
          <p className="text-white/50 text-sm mt-1">
            Your personal financial mentor. I analyze your decisions and help you become a better investor.
          </p>
          {!unlocked && (
            <p className="text-amber-400 text-sm mt-2">Unlocks at Level 2 (Current: {state.level})</p>
          )}
        </div>
      </div>

      {!unlocked ? (
        <div className="glass-panel p-12 text-center">
          <Lock className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <p className="text-white/40 text-lg">AI Coach unlocks at Level 2</p>
          <p className="text-white/30 text-sm mt-2">Make your first trades and complete missions to level up</p>
        </div>
      ) : (
        <>
          {/* Recent Insights */}
          {state.behavioralInsights.length > 0 && (
            <div className="glass-panel p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Recent Insights
              </h3>
              <div className="space-y-3">
                {[...state.behavioralInsights].reverse().slice(0, 10).map((insight, i) => {
                  const bias = BIAS_EXPLANATIONS[insight.type];
                  return (
                    <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-lg">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        insight.type.includes("warning") || insight.type.includes("fear") || insight.type.includes("loss")
                          ? "bg-red-500/20" : "bg-emerald-500/20"
                      }`}>
                        {bias ? (
                          <bias.icon className={`w-4 h-4 ${bias.color}`} />
                        ) : (
                          <Lightbulb className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80 text-sm">{insight.message}</p>
                        <p className="text-white/30 text-xs mt-1">
                          Day {insight.day}, Month {insight.month}, Year {insight.year}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detected Biases */}
          {state.behavioralFlags.length > 0 && (
            <div className="glass-panel p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                Behavioral Patterns Detected
              </h3>
              <div className="space-y-3">
                {[...new Set(state.behavioralFlags)].map((flag) => {
                  const bias = BIAS_EXPLANATIONS[flag];
                  if (!bias) return null;
                  const Icon = bias.icon;
                  return (
                    <div key={flag} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${bias.color}`} />
                        <p className="text-white font-semibold">{bias.title}</p>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed">{bias.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Financial Tips */}
          <div className="glass-panel p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Financial Wisdom
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { title: "The Rule of 72", text: "Divide 72 by your annual return rate to estimate how many years it takes to double your money." },
                { title: "Diversification", text: "Don't put all your eggs in one basket. Spread investments across sectors to reduce risk." },
                { title: "Compound Growth", text: "Time is your greatest asset. Starting early with consistent investing beats timing the market." },
                { title: "ESG Investing", text: "Sustainable companies often outperform because they manage risks better and attract loyal customers." },
                { title: "Debt Management", text: "High-interest debt erodes wealth faster than most investments can generate returns. Pay it off first." },
                { title: "Emergency Fund", text: "Keep 3-6 months of expenses in cash before investing aggressively. It protects you from forced selling." },
              ].map((tip, i) => (
                <div key={i} className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                  <p className="text-emerald-400 text-sm font-semibold mb-1">{tip.title}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
