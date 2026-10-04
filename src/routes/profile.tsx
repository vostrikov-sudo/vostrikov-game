import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useProfile, profileLevel } from "@/lib/profile-store";
import { WEAPON_ORDER, WEAPONS, upgradeCost } from "@/lib/weapons";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const p = useProfile();
  const lvl = profileLevel(p.xp);
  const xpInto = p.xp % 180;
  const need = 180;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl text-fg">Профиль героя</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-border bg-surface p-5">
          <img src="/photos/character.png" alt="" className="mx-auto h-56 w-auto" />
          <label className="mt-4 block text-xs text-muted">Имя</label>
          <input
            value={p.name}
            onChange={(e) => p.setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-subtle px-3 py-2 text-fg"
          />
          <dl className="mt-5 space-y-2 text-sm">
            <Row k="Уровень" v={String(lvl)} />
            <Row k="Опыт" v={`${xpInto} / ${need}`} />
            <Row k="Монеты" v={String(p.coins)} />
            <Row k="Сердца в раннере" v={String(3 + p.extraHearts)} />
            <Row k="Рекорд раннера" v={String(p.runnerBest)} />
            <Row k="Рекорд сражения" v={String(p.battleBest)} />
          </dl>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-subtle">
            <div className="h-full bg-accent" style={{ width: `${(xpInto / need) * 100}%` }} />
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="font-display text-lg text-fg">Жизни</h2>
            <p className="mt-1 text-sm text-muted">Стартовые сердца в раннере. Максимум пять.</p>
            <div className="mt-3 flex items-center gap-2">
              {Array.from({ length: 3 + p.extraHearts }).map((_, i) => (
                <Heart key={i} className="size-6 fill-danger text-danger" />
              ))}
            </div>
            <button
              type="button"
              className="btn-primary mt-4"
              disabled={p.extraHearts >= 2 || p.coins < 90}
              onClick={() => p.buyHeart(90)}
            >
              Докупить сердце · 90
            </button>
          </section>

          <section>
            <h2 className="font-display text-lg text-fg">Оружие</h2>
            <p className="mt-1 text-sm text-muted">Покупай стволы за монеты, качай урон и скорострельность.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {WEAPON_ORDER.map((id) => {
                const w = WEAPONS[id];
                const owned = p.unlocked.includes(id);
                const lv = p.levels[id] ?? 1;
                const up = upgradeCost(lv);
                return (
                  <article key={id} className="rounded-lg border border-border bg-surface p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-fg">{w.name}</h3>
                      <span className="text-xs text-muted">{owned ? `ур. ${lv}` : `${w.cost} мон.`}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{w.blurb}</p>
                    <p className="mt-2 text-xs text-muted">Урон {Math.round(w.baseDamage * (1 + 0.22 * (lv - 1)))}</p>
                    {!owned ? (
                      <button
                        type="button"
                        className="btn-ghost mt-3 w-full"
                        disabled={p.coins < w.cost}
                        onClick={() => p.unlock(id, w.cost)}
                      >
                        Купить
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-ghost mt-3 w-full"
                        disabled={p.coins < up || lv >= 8}
                        onClick={() => p.upgrade(id, up)}
                      >
                        Улучшить · {up}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="tabular-nums text-fg">{v}</dd>
    </div>
  );
}
