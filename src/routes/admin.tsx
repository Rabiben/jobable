import { createFileRoute } from "@tanstack/react-router";
import AdminPage from "@/components/screens/AdminPage";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Espace enseignant — Atlas Green Investor" },
      {
        name: "description",
        content: "Tableau de bord administrateur : résultats de tous les joueurs.",
      },
    ],
  }),
  component: AdminPage,
});
