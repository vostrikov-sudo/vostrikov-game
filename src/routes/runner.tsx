import { createFileRoute } from "@tanstack/react-router";
import { RunnerGame } from "@/game/runner/RunnerGame";

export const Route = createFileRoute("/runner")({ component: Page });

function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display mb-6 text-2xl text-fg">Раннер</h1>
      <RunnerGame />
    </main>
  );
}
