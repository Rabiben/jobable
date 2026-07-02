import { createFileRoute } from "@tanstack/react-router";
import GameScreen from "@/components/screens/GameScreen";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Play — Atlas Green Investor" },
      {
        name: "description",
        content:
          "Manage your portfolio, trade on the Casablanca Stock Exchange, and grow your wealth.",
      },
    ],
  }),
  component: GameScreen,
});
