import { createFileRoute } from "@tanstack/react-router";
import { BattleGame } from "@/game/battle/BattleGame";

export const Route = createFileRoute("/battle")({
  component: Page,
  head: () => ({
    links: import.meta.env.DEV
      ? [
          {
            rel: "stylesheet",
            href: `${import.meta.env.BASE_URL}src/game/battle/battle.css?direct`,
          },
        ]
      : [],
  }),
});

function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-4">
      <h1 className="font-display mb-1 text-2xl text-fg">Сражение</h1>
      <BattleGame />
    </main>
  );
}
