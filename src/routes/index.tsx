import { createFileRoute } from "@tanstack/react-router";
import TitleScreen from "@/components/screens/TitleScreen";

import ChatWidget from "@/components/game/ChatWidget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas Green Investor — Casablanca Finance Adventure" },
      {
        name: "description",
        content:
          "Start with nothing, master the Casablanca Stock Exchange, and build sustainable wealth in this financial simulation game.",
      },
      { property: "og:title", content: "Atlas Green Investor" },
      {
        property: "og:description",
        content:
          "A financial simulation game set in Casablanca. Invest, manage loans, build companies, and grow your ESG-driven empire.",
      },
      { property: "og:image", content: "/title-bg.jpg" },
      { name: "twitter:image", content: "/title-bg.jpg" },
    ],
  }),
  component: TitleScreen,
});



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}