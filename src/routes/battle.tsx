import { createFileRoute } from "@tanstack/react-router";
import { BattleGame } from "@/game/battle/BattleGame";

export const Route = createFileRoute("/battle")({ component: Page });

function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display mb-6 text-2xl text-fg">Сражение</h1>
      <BattleGame />
    </main>
  );
}
