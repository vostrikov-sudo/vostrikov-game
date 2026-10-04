import { useEffect, useRef, useState, type ReactNode } from "react";
import { Heart } from "lucide-react";
import { randomTask, type QuizTask } from "@/lib/quiz";
import { useProfile } from "@/lib/profile-store";

type Kind = "crate" | "spike" | "drone" | "tank" | "kiosk";

type Ent = {
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  hit?: boolean;
};

type Coin = { x: number; y: number; taken: boolean };
type Plat = { x: number; y: number; w: number };

const VW = 960;
const VH = 540;
const GROUND = 428;

export function RunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const extraHearts = useProfile((s) => s.extraHearts);
  const addCoins = useProfile((s) => s.addCoins);
  const addXp = useProfile((s) => s.addXp);
  const recordRunner = useProfile((s) => s.recordRunner);

  const [phase, setPhase] = useState<"ready" | "run" | "task" | "over">("ready");
  const [hud, setHud] = useState({ score: 0, dist: 0, hearts: 3, max: 3 });
  const [task, setTask] = useState<QuizTask | null>(null);
  const [taskFail, setTaskFail] = useState(false);
  const holdRef = useRef<number | null>(null);
  const [holdP, setHoldP] = useState(0);

  const api = useRef({
    start: () => {},
    jump: () => {},
    resume: (_ok: boolean) => {},
    hearts: 3,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gfx = canvas.getContext("2d")!;

    const imgs = {
      hero: load("/photos/character.png"),
      sky: load("/game/runner-sky.jpg"),
      ground: load("/game/runner-ground.jpg"),
      crate: load("/game/crate.png"),
      drone: load("/game/drone.png"),
      tank: load("/game/tank.png"),
    };

    const maxHearts = 3 + extraHearts;
    let running = false;
    let paused = false;
    let acc = 0;
    let last = performance.now();
    let score = 0;
    let dist = 0;
    let hearts = maxHearts;
    let inv = 0;
    let speed = 280;
    let world = 0;
    let spawnAt = 420;
    let kioskAt = 900;
    let coyote = 0;
    let buffer = 0;
    let shake = 0;

    const player = { x: 150, y: GROUND - 86, w: 52, h: 86, vy: 0, on: false };
    let plats: Plat[] = [{ x: -40, y: GROUND, w: 1400 }];
    let ents: Ent[] = [];
    let coins: Coin[] = [];
    const keys = new Set<string>();
    let jumpHeld = false;
    let wantJump = false;

    api.current = {
      start: () => {
        running = true;
        paused = false;
        score = 0;
        dist = 0;
        hearts = maxHearts;
        inv = 0;
        speed = 280;
        world = 0;
        spawnAt = 420;
        kioskAt = 520;
        coyote = 0;
        buffer = 0;
        player.x = 150;
        player.y = GROUND - 86;
        player.vy = 0;
        player.on = true;
        plats = [{ x: -40, y: GROUND, w: 1600 }];
        ents = [];
        coins = [];
        setPhase("run");
        sync();
      },
      jump: () => {
        wantJump = true;
        buffer = 0.12;
      },
      resume: (ok) => {
        paused = false;
        if (ok) {
          score += 80;
          addCoins(taskReward());
          addXp(12);
        }
        setTask(null);
        setPhase("run");
        sync();
      },
      hearts,
    };

    function taskReward() {
      return 30;
    }

    function sync() {
      setHud({ score: Math.floor(score), dist: Math.floor(dist), hearts, max: maxHearts });
      api.current.hearts = hearts;
    }

    function hurt() {
      if (inv > 0) return;
      hearts -= 1;
      inv = 1.15;
      shake = 10;
      sync();
      if (hearts <= 0) {
        running = false;
        recordRunner(Math.floor(score), Math.floor(dist));
        addXp(Math.floor(dist / 40));
        addCoins(Math.floor(score / 25));
        setPhase("over");
      }
    }

    function spawnAhead() {
      const lastP = plats[plats.length - 1]!;
      const end = lastP.x + lastP.w;
      if (end > world + VW + 900) return;

      const roll = Math.random();
      if (roll < 0.18 && speed > 300) {
        const gap = 90 + Math.random() * 70;
        const w = 280 + Math.random() * 220;
        plats.push({ x: end + gap, y: GROUND, w });
      } else {
        plats.push({ x: end - 8, y: GROUND, w: 340 + Math.random() * 260 });
      }
      const p = plats[plats.length - 1]!;

      const pattern = Math.random();
      if (pattern < 0.28) {
        ents.push({ kind: "crate", x: p.x + 80 + Math.random() * Math.max(40, p.w - 140), y: GROUND - 56, w: 56, h: 56, vx: 0 });
      } else if (pattern < 0.46) {
        ents.push({ kind: "spike", x: p.x + 70, y: GROUND - 28, w: 70, h: 28, vx: 0 });
      } else if (pattern < 0.62) {
        ents.push({ kind: "crate", x: p.x + 50, y: GROUND - 56, w: 52, h: 56, vx: 0 });
        ents.push({ kind: "crate", x: p.x + 108, y: GROUND - 56, w: 52, h: 56, vx: 0 });
      } else if (pattern < 0.78) {
        ents.push({ kind: "drone", x: p.x + 120, y: GROUND - 150 - Math.random() * 40, w: 48, h: 36, vx: -40 });
      } else {
        ents.push({ kind: "tank", x: p.x + 90, y: GROUND - 44, w: 86, h: 44, vx: -30 });
      }

      const cx = p.x + 40;
      for (let i = 0; i < 4; i++) {
        coins.push({ x: cx + i * 36, y: GROUND - 110 - Math.sin(i) * 28, taken: false });
      }

      if (p.x > kioskAt) {
        ents.push({ kind: "kiosk", x: p.x + p.w * 0.55, y: GROUND - 78, w: 48, h: 78, vx: 0 });
        kioskAt += 700 + Math.random() * 500;
      }
    }

    function doJump() {
      if (coyote > 0 || player.on) {
        player.vy = -720;
        player.on = false;
        coyote = 0;
        buffer = 0;
        wantJump = false;
      }
    }

    function step(dt: number) {
      if (!running || paused) return;
      speed = Math.min(520, 280 + dist * 0.35);
      world += speed * dt;
      dist += speed * dt * 0.06;
      score += dt * 8;
      player.x = world + 150;
      inv = Math.max(0, inv - dt);
      shake = Math.max(0, shake - dt * 28);

      if (wantJump || buffer > 0) doJump();
      buffer = Math.max(0, buffer - dt);

      const falling = player.vy > 0;
      const g = falling ? 2600 : jumpHeld ? 1650 : 2400;
      player.vy = Math.min(980, player.vy + g * dt);
      player.y += player.vy * dt;
      player.on = false;

      for (const p of plats) {
        if (player.x + player.w * 0.6 > p.x && player.x + player.w * 0.25 < p.x + p.w) {
          if (player.y + player.h >= p.y && player.y + player.h <= p.y + 28 && player.vy >= 0) {
            player.y = p.y - player.h;
            player.vy = 0;
            player.on = true;
          }
        }
      }
      coyote = player.on ? 0.1 : Math.max(0, coyote - dt);
      if (buffer > 0 && player.on) doJump();

      if (player.y > VH + 40) hurt();

      spawnAhead();
      plats = plats.filter((p) => p.x + p.w > world - 80);

      for (const e of ents) {
        e.x += e.vx * dt;
        if (e.hit) continue;
        const px = player.x + 10;
        const py = player.y + 12;
        const pw = player.w - 20;
        const ph = player.h - 16;
        if (px < e.x + e.w && px + pw > e.x && py < e.y + e.h && py + ph > e.y) {
          if (e.kind === "kiosk") {
            e.hit = true;
            paused = true;
            const t = randomTask();
            setTask(t);
            setTaskFail(false);
            setHoldP(0);
            setPhase("task");
          } else {
            e.hit = true;
            hurt();
          }
        }
      }
      ents = ents.filter((e) => e.x + e.w > world - 40);

      for (const c of coins) {
        if (c.taken) continue;
        const dx = player.x + player.w / 2 - c.x;
        const dy = player.y + player.h / 2 - c.y;
        if (dx * dx + dy * dy < 40 * 40) {
          c.taken = true;
          score += 18;
        }
      }
      coins = coins.filter((c) => c.x > world - 20);
      sync();
    }

    function draw() {
      const ox = shake ? (Math.random() - 0.5) * shake : 0;
      const oy = shake ? (Math.random() - 0.5) * shake : 0;
      gfx.setTransform(1, 0, 0, 1, ox, oy);
      gfx.fillStyle = "#8aa3b8";
      gfx.fillRect(0, 0, VW, VH);

      const sky = imgs.sky;
      if (sky.complete && sky.naturalWidth) {
        const sx = -(world * 0.15) % VW;
        gfx.drawImage(sky, sx, 0, VW, VH);
        gfx.drawImage(sky, sx + VW, 0, VW, VH);
      }

      gfx.fillStyle = "rgba(12,18,24,0.18)";
      gfx.fillRect(0, 0, VW, VH);

      const gimg = imgs.ground;
      for (const p of plats) {
        const x = p.x - world;
        if (x > VW || x + p.w < 0) continue;
        if (gimg.complete && gimg.naturalWidth) {
          gfx.drawImage(gimg, x, p.y - 18, p.w, VH - p.y + 18);
        } else {
          gfx.fillStyle = "#3d5c3a";
          gfx.fillRect(x, p.y, p.w, VH - p.y);
        }
        gfx.fillStyle = "#5d8a4a";
        gfx.fillRect(x, p.y, p.w, 8);
      }

      for (const coin of coins) {
        if (coin.taken) continue;
        const x = coin.x - world;
        gfx.beginPath();
        gfx.arc(x, coin.y, 9, 0, Math.PI * 2);
        gfx.fillStyle = "#d8c9a3";
        gfx.fill();
        gfx.strokeStyle = "#8a7a55";
        gfx.stroke();
      }

      for (const e of ents) {
        if (e.hit && e.kind === "kiosk") continue;
        const x = e.x - world;
        if (e.kind === "crate") {
          const im = imgs.crate;
          if (im.complete && im.naturalWidth) gfx.drawImage(im, x, e.y, e.w, e.h);
          else {
            gfx.fillStyle = "#8a6239";
            gfx.fillRect(x, e.y, e.w, e.h);
          }
        } else if (e.kind === "spike") {
          gfx.fillStyle = "#c45c4a";
          gfx.beginPath();
          gfx.moveTo(x, e.y + e.h);
          gfx.lineTo(x + e.w * 0.25, e.y);
          gfx.lineTo(x + e.w * 0.5, e.y + e.h);
          gfx.lineTo(x + e.w * 0.75, e.y);
          gfx.lineTo(x + e.w, e.y + e.h);
          gfx.closePath();
          gfx.fill();
        } else if (e.kind === "drone") {
          const im = imgs.drone;
          if (im.complete && im.naturalWidth) gfx.drawImage(im, x, e.y, e.w, e.h);
          else {
            gfx.fillStyle = "#4a5560";
            gfx.fillRect(x, e.y, e.w, e.h);
          }
        } else if (e.kind === "tank") {
          const im = imgs.tank;
          if (im.complete && im.naturalWidth) gfx.drawImage(im, x, e.y, e.w, e.h);
          else {
            gfx.fillStyle = "#5a6848";
            gfx.fillRect(x, e.y, e.w, e.h);
          }
        } else if (e.kind === "kiosk") {
          gfx.fillStyle = "#1f6f62";
          gfx.fillRect(x, e.y, e.w, e.h);
          gfx.fillStyle = "#2dd4bf";
          gfx.fillRect(x + 6, e.y + 10, e.w - 12, 22);
          gfx.fillStyle = "#06201c";
          gfx.font = "bold 11px sans-serif";
          gfx.fillText("ЗАДАНИЕ", x - 4, e.y - 8);
        }
      }

      const px = player.x - world;
      gfx.save();
      if (inv > 0 && Math.floor(inv * 12) % 2 === 0) gfx.globalAlpha = 0.35;
      const hero = imgs.hero;
      if (hero.complete && hero.naturalWidth) gfx.drawImage(hero, px, player.y, player.w, player.h);
      else {
        gfx.fillStyle = "#2a6a8f";
        gfx.fillRect(px, player.y, player.w, player.h);
      }
      gfx.restore();
      gfx.setTransform(1, 0, 0, 1, 0, 0);
    }

    function loop(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      acc += dt;
      while (acc >= 1 / 60) {
        step(1 / 60);
        acc -= 1 / 60;
      }
      draw();
      raf = requestAnimationFrame(loop);
    }

    const onKey = (e: KeyboardEvent) => {
      keys.add(e.code);
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        jumpHeld = true;
        api.current.jump();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      keys.delete(e.code);
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") jumpHeld = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);

    let raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [addCoins, addXp, extraHearts, recordRunner]);

  function answerChoice(i: number) {
    if (!task || task.kind !== "choice") return;
    if (i === task.answer) {
      addCoins(task.reward);
      api.current.resume(true);
    } else {
      setTaskFail(true);
    }
  }
  function answerWire(c: string) {
    if (!task || task.kind !== "wires") return;
    if (c === task.color) {
      addCoins(task.reward);
      api.current.resume(true);
    } else setTaskFail(true);
  }
  function startHold() {
    if (!task || task.kind !== "hold") return;
    const t0 = performance.now();
    const dur = task.duration * 1000;
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      setHoldP(p);
      if (p >= 1) {
        holdRef.current = null;
        addCoins(task.reward);
        api.current.resume(true);
        return;
      }
      holdRef.current = requestAnimationFrame(tick);
    };
    holdRef.current = requestAnimationFrame(tick);
  }
  function endHold() {
    if (holdRef.current) cancelAnimationFrame(holdRef.current);
    holdRef.current = null;
    if (holdP < 1) setHoldP(0);
  }

  return (
    <div className="relative mx-auto w-full max-w-[960px]">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: hud.max }).map((_, i) => (
            <Heart
              key={i}
              className={`size-6 ${i < hud.hearts ? "fill-danger text-danger" : "text-muted"}`}
              strokeWidth={1.75}
            />
          ))}
        </div>
        <div className="flex gap-4 font-medium tabular-nums text-fg">
          <span>Очки {hud.score}</span>
          <span className="text-muted">{hud.dist} м</span>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
        <canvas
          ref={canvasRef}
          width={VW}
          height={VH}
          className="block h-auto w-full touch-none"
          onPointerDown={() => {
            if (phase === "run") api.current.jump();
          }}
        />
        {phase === "ready" && (
          <Panel>
            <h2 className="font-display text-2xl text-fg">Раннер</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Прыгай через ящики, шипы, танки и дроны. Забеги в зелёный терминал — откроется задание. Не теряй сердца.
            </p>
            <button type="button" className="btn-primary mt-5" onClick={() => api.current.start()}>
              Старт
            </button>
          </Panel>
        )}
        {phase === "over" && (
          <Panel>
            <h2 className="font-display text-2xl text-fg">Падение</h2>
            <p className="mt-2 text-sm text-muted">
              Очки {hud.score} · {hud.dist} м
            </p>
            <button type="button" className="btn-primary mt-5" onClick={() => api.current.start()}>
              Ещё раз
            </button>
          </Panel>
        )}
        {phase === "task" && task && (
          <Panel>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">{task.title}</p>
            <h3 className="mt-2 font-display text-xl text-fg">{task.prompt}</h3>
            {taskFail && <p className="mt-2 text-sm text-danger">Неверно — попробуй ещё.</p>}
            {task.kind === "choice" && (
              <div className="mt-4 grid w-full max-w-md gap-2">
                {task.options.map((o, i) => (
                  <button key={o} type="button" className="btn-ghost text-left" onClick={() => answerChoice(i)}>
                    {o}
                  </button>
                ))}
              </div>
            )}
            {task.kind === "wires" && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(["red", "blue", "green", "yellow"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => answerWire(c)}
                    className="h-12 w-20 rounded-md border border-border"
                    style={{ background: { red: "#c45c4a", blue: "#4a7ec4", green: "#3d9a6a", yellow: "#c4b059" }[c] }}
                    aria-label={c}
                  />
                ))}
              </div>
            )}
            {task.kind === "hold" && (
              <div className="mt-5 w-full max-w-xs">
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-subtle">
                  <div className="h-full bg-accent" style={{ width: `${holdP * 100}%` }} />
                </div>
                <button
                  type="button"
                  className="btn-primary w-full"
                  onPointerDown={startHold}
                  onPointerUp={endHold}
                  onPointerLeave={endHold}
                >
                  Удерживать
                </button>
              </div>
            )}
            <button type="button" className="mt-4 text-sm text-muted underline" onClick={() => api.current.resume(false)}>
              Пропустить
            </button>
          </Panel>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-muted">Пробел / стрелка вверх / тап — прыжок</p>
    </div>
  );
}

function load(src: string) {
  const i = new Image();
  i.crossOrigin = "anonymous";
  i.src = src;
  return i;
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[color-mix(in_oklab,var(--color-bg)_78%,transparent)] px-6 text-center">
      {children}
    </div>
  );
}
