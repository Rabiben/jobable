import { createFileRoute } from "@tanstack/react-router";
import Login from "@/components/screens/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Atlas Green Investor" },
      {
        name: "description",
        content: "Sign in to save your investor profile and track your progress.",
      },
    ],
  }),
  component: Login,
});
