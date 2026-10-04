import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useProfile, profileLevel } from "@/lib/profile-store";

const LINKS = [
  { to: "/", label: "Главная" },
  { to: "/profile", label: "Профиль" },
  { to: "/runner", label: "Раннер" },
  { to: "/battle", label: "Сражение" },
] as const;

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hydrate = useProfile((s) => s.hydrate);
  const hydrated = useProfile((s) => s.hydrated);
  const name = useProfile((s) => s.name);
  const coins = useProfile((s) => s.coins);
  const xp = useProfile((s) => s.xp);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-[color-mix(in_oklab,var(--color-bg)_92%,transparent)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-sm tracking-wide text-accent">
            VOSTRIKOV
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-md px-3 py-2 ${
                  pathname === l.to ? "bg-subtle text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          {hydrated && (
            <Link to="/profile" className="hidden items-center gap-2 text-xs text-muted sm:flex">
              <span className="text-fg">{name}</span>
              <span>ур. {profileLevel(xp)}</span>
              <span>{coins} мон.</span>
            </Link>
          )}
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
