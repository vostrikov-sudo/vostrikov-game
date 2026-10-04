import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      <section className="relative min-h-[78vh] overflow-hidden">
        <img
          src="/photos/hero.jpg"
          alt="Главный герой у школы"
          className="absolute inset-0 size-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-[color-mix(in_oklab,var(--color-bg)_28%,transparent)] to-[color-mix(in_oklab,var(--color-bg)_12%,transparent)]" />
        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-end px-4 pb-16 text-center">
          <p className="text-xs font-medium tracking-[0.25em] text-accent">ШКОЛА №124 · ЕКАТЕРИНБУРГ</p>
          <h1 className="font-display mt-3 text-4xl tracking-tight text-fg sm:text-6xl">VOSTRIKOV GAME</h1>
          <p className="mt-3 max-w-lg text-muted">Главный герой. Две игры. Один двор.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/runner" className="btn-primary">
              Раннер
            </Link>
            <Link to="/battle" className="btn-ghost">
              Сражение
            </Link>
          </div>
        </div>
      </section>

      <section className="relative min-h-[70vh] overflow-hidden">
        <img src="/photos/armwrestle.jpg" alt="Рукопожатие" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-[color-mix(in_oklab,var(--color-bg)_62%,transparent)]" />
        <div className="relative z-10 mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:grid-cols-2">
          <article className="rounded-lg border border-border bg-[color-mix(in_oklab,var(--color-bg)_80%,transparent)] p-6">
            <h2 className="font-display text-xl text-fg">Раннер</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
              <li>Прыжок: пробел, стрелка вверх или тап.</li>
              <li>Сердца сверху — жизни. Их можно докупить в профиле.</li>
              <li>Ящики, шипы, ямы, танки и дроны — прыгай вовремя.</li>
              <li>Зелёный терминал останавливает забег и открывает задание: тест, провода или удержание.</li>
            </ul>
          </article>
          <article className="rounded-lg border border-border bg-[color-mix(in_oklab,var(--color-bg)_80%,transparent)] p-6">
            <h2 className="font-display text-xl text-fg">Сражение</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
              <li>Карта — школьный двор с газоном, дорожками и корпусами.</li>
              <li>WASD — ходьба, мышь — прицел, клик — огонь.</li>
              <li>Враги: солдаты, танки, дроны. Прячься за здания.</li>
              <li>Меч, пистолет, пушка, ракеты, дроны — покупка и апгрейд в профиле.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:grid-cols-2">
        <Link to="/runner" className="group overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex h-48 items-center justify-center bg-subtle">
            <img src="/photos/character.png" alt="" className="h-44 w-auto" />
          </div>
          <div className="p-5">
            <h3 className="font-display text-lg text-fg">Раннер</h3>
            <p className="mt-1 text-sm text-muted">Марио-забег по школьному двору с заданиями.</p>
          </div>
        </Link>
        <Link to="/battle" className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex h-48 items-center justify-center bg-subtle">
            <img src="/photos/character.png" alt="" className="h-44 w-auto" />
          </div>
          <div className="p-5">
            <h3 className="font-display text-lg text-fg">Сражение</h3>
            <p className="mt-1 text-sm text-muted">Танки и дроны на настоящей карте двора.</p>
          </div>
        </Link>
      </section>
    </main>
  );
}
