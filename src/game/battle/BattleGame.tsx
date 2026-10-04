import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Crosshair, Pause, Play, RotateCcw, Zap } from "lucide-react";
import { WEAPONS, WEAPON_ORDER, type WeaponId } from "@/lib/weapons";
import { useProfile } from "@/lib/profile-store";
import { Battle, type Phase, type Point } from "./engine";
import { render, VIEW, worldPoint } from "./render";
import "./battle.css";

const initialHud = {
  hp: 100,
  score: 0,
  wave: 1,
  weapon: "pistol" as WeaponId,
  ammo: 14,
  reload: 0,
  dash: 0,
  enemies: 7,
  breakTime: 0,
  available: [] as WeaponId[],
};
type Stick = { id: number | null; x: number; y: number };
export function BattleGame() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Battle | null>(null);
  const controls = useRef({
    move: { id: null, x: 0, y: 0 } as Stick,
    aim: { id: null, x: 0, y: 0 } as Stick,
    dash: false,
  });
  const [phase, setPhase] = useState<Phase>("ready");
  const [hud, setHud] = useState(initialHud);
  const api = useRef({
    start: () => {},
    pause: () => {},
    select: (_id: WeaponId) => {},
    reload: () => {},
  });

  useEffect(() => {
    const stage = canvas.current;
    if (!stage) return;
    const ctx = stage.getContext("2d");
    if (!ctx) return;
    const view = { ...VIEW };
    const resize = new ResizeObserver(() => {
      const rect = stage.getBoundingClientRect();
      view.w = rect.width < 600 ? 600 : VIEW.w;
      view.h = (view.w * rect.height) / rect.width;
      stage.width = Math.round(view.w);
      stage.height = Math.round(view.h);
    });
    resize.observe(stage.parentElement!);
    let battle = new Battle();
    game.current = battle;
    const keys = new Set<string>();
    let aim: Point | null = null,
      firing = false,
      last = performance.now(),
      accumulator = 0,
      hudTime = 0,
      recorded = false;
    const resetInput = () => {
      keys.clear();
      firing = false;
      controls.current.dash = false;
      for (const stick of [controls.current.move, controls.current.aim]) {
        stick.id = null;
        stick.x = 0;
        stick.y = 0;
      }
    };
    const sync = () =>
      setHud({
        hp: battle.hp,
        score: battle.score,
        wave: battle.wave,
        weapon: battle.weapon,
        ammo: battle.ammo[battle.weapon],
        reload: battle.reloadLeft,
        dash: battle.dashLeft,
        enemies: battle.remaining + battle.enemies.length,
        breakTime: battle.intermission,
        available: WEAPON_ORDER.filter((id) => battle.available(id)),
      });
    const pause = () => {
      if (battle.phase !== "run" && battle.phase !== "paused") return;
      battle.phase = battle.phase === "run" ? "paused" : "run";
      resetInput();
      setPhase(battle.phase);
    };
    api.current = {
      start: () => {
        const profile = useProfile.getState();
        battle = new Battle(profile.levels, profile.unlocked);
        game.current = battle;
        battle.phase = "run";
        recorded = false;
        resetInput();
        aim = null;
        setPhase("run");
        sync();
        stage.focus();
      },
      pause,
      select: (id) => {
        battle.select(id);
        sync();
      },
      reload: () => {
        battle.reload();
        sync();
      },
    };
    const local = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * view.w,
        y: ((e.clientY - rect.top) / rect.height) * view.h,
      };
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0 || battle.phase !== "run") return;
      aim = local(e);
      firing = true;
      stage.focus();
      stage.setPointerCapture(e.pointerId);
    };
    const pointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch") aim = local(e);
    };
    const up = () => {
      firing = false;
    };
    const keydown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.matches("input, textarea, select")) return;
      if (battle.phase !== "run" && battle.phase !== "paused") return;
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code))
        e.preventDefault();
      if (e.code === "Escape" || e.code === "KeyP") {
        if (!e.repeat) pause();
        return;
      }
      if (battle.phase !== "run") return;
      keys.add(e.code);
      if (e.code === "KeyR") battle.reload();
      const digit = Number(e.code.replace("Digit", ""));
      if (digit >= 1 && digit <= 9) battle.select(WEAPON_ORDER[digit - 1]);
    };
    const keyup = (e: KeyboardEvent) => keys.delete(e.code);
    const wheel = (e: WheelEvent) => {
      if (battle.phase !== "run") return;
      e.preventDefault();
      const available = WEAPON_ORDER.filter((id) => battle.available(id));
      const i = available.indexOf(battle.weapon);
      battle.select(available[(i + (e.deltaY > 0 ? 1 : -1) + available.length) % available.length]);
    };
    const blur = () => {
      if (battle.phase === "run") pause();
      else resetInput();
    };
    const visibility = () => {
      if (document.hidden) blur();
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", pointerMove);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("lostpointercapture", up);
    stage.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", visibility);
    const probe = {
      getYaw: () => battle.player.angle,
      getPosition: () => ({ x: battle.player.x, y: battle.player.y }),
      setKeys: (codes: string[]) => {
        keys.clear();
        codes.forEach((code) => keys.add(code));
      },
      getState: () => ({
        phase: battle.phase,
        hp: battle.hp,
        score: battle.score,
        wave: battle.wave,
        ammo: battle.ammo[battle.weapon],
        weapon: battle.weapon,
        bullets: battle.bullets.length,
        reload: battle.reloadLeft,
        dash: battle.dashLeft,
      }),
    };
    const testWindow = window as unknown as { __controlsTest?: typeof probe };
    if (import.meta.env.DEV) testWindow.__controlsTest = probe;
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      accumulator += dt;
      const c = controls.current;
      let angle = battle.player.angle;
      if (Math.hypot(c.aim.x, c.aim.y) > 0.18) angle = Math.atan2(c.aim.y / 0.68, c.aim.x);
      else if (aim) {
        const p = worldPoint(aim, battle, view);
        angle = Math.atan2(p.y - battle.player.y, p.x - battle.player.x);
      }
      const input = {
        x:
          Number(keys.has("KeyD") || keys.has("ArrowRight")) -
          Number(keys.has("KeyA") || keys.has("ArrowLeft")) +
          c.move.x,
        y:
          Number(keys.has("KeyS") || keys.has("ArrowDown")) -
          Number(keys.has("KeyW") || keys.has("ArrowUp")) +
          c.move.y,
        angle,
        fire: firing || keys.has("Space") || Math.hypot(c.aim.x, c.aim.y) > 0.18,
        dash: keys.has("ShiftLeft") || keys.has("ShiftRight") || c.dash,
      };
      while (accumulator >= 1 / 60) {
        battle.step(1 / 60, input);
        accumulator -= 1 / 60;
      }
      c.dash = false;
      if (battle.phase === "over" && !recorded) {
        recorded = true;
        resetInput();
        const profile = useProfile.getState();
        profile.recordBattle(battle.score, battle.wave);
        profile.addXp(Math.floor(battle.score / 20));
        profile.addCoins(Math.floor(battle.score / 18));
        setPhase("over");
        sync();
      }
      hudTime += dt;
      if (hudTime > 0.1) {
        sync();
        hudTime = 0;
      }
      render(ctx, battle, c.aim.id !== null ? null : aim, view);
      raf = requestAnimationFrame(loop);
    };
    sync();
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      resetInput();
      game.current = null;
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", pointerMove);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      stage.removeEventListener("lostpointercapture", up);
      stage.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      if (testWindow.__controlsTest === probe) delete testWindow.__controlsTest;
    };
  }, []);

  const stickMove = (kind: "move" | "aim", e: ReactPointerEvent<HTMLDivElement>) => {
    const stick = controls.current[kind];
    if (stick.id !== e.pointerId) return;
    const rect = e.currentTarget.getBoundingClientRect(),
      x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2),
      y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2),
      length = Math.hypot(x, y);
    stick.x = length < 0.18 ? 0 : x / Math.max(1, length);
    stick.y = length < 0.18 ? 0 : y / Math.max(1, length);
    e.currentTarget.style.setProperty("--stick-x", `${stick.x * 26}px`);
    e.currentTarget.style.setProperty("--stick-y", `${stick.y * 26}px`);
  };
  const stickUp = (kind: "move" | "aim", e: ReactPointerEvent<HTMLDivElement>) => {
    const stick = controls.current[kind];
    if (stick.id !== e.pointerId) return;
    stick.id = null;
    stick.x = 0;
    stick.y = 0;
    e.currentTarget.style.setProperty("--stick-x", "0px");
    e.currentTarget.style.setProperty("--stick-y", "0px");
  };
  return (
    <section className="battle" aria-label="Боевая арена">
      <div className="battle-status">
        <div>
          <span className="battle-eyebrow">ОПЕРАЦИЯ / ДВОР 124</span>
          <strong>Волна {hud.wave.toString().padStart(2, "0")}</strong>
        </div>
        <div className="battle-health">
          <span>
            Здоровье <b>{hud.hp}/100</b>
          </span>
          <meter min="0" max="100" value={hud.hp} aria-label="Здоровье" />
        </div>
        <div className="battle-score">
          <span className="battle-eyebrow">ОЧКИ</span>
          <strong>{hud.score.toString().padStart(5, "0")}</strong>
        </div>
        <button
          className="battle-icon"
          aria-label={phase === "paused" ? "Продолжить бой" : "Пауза"}
          disabled={phase === "ready" || phase === "over"}
          onClick={() => api.current.pause()}
        >
          {phase === "paused" ? <Play size={18} /> : <Pause size={18} />}
        </button>
      </div>
      <div className="battle-stage">
        <canvas
          ref={canvas}
          width={VIEW.w}
          height={VIEW.h}
          tabIndex={0}
          aria-label="Арена. WASD — движение, мышь — прицел, пробел — огонь."
        />
        {phase === "run" && (
          <>
            <div className="battle-objective">
              {hud.breakTime > 0
                ? `Сектор зачищен · следующая волна через ${Math.ceil(hud.breakTime)}`
                : `Зачистите сектор · осталось ${hud.enemies}`}
            </div>
            <div className="battle-ammo">
              <Crosshair size={18} />
              <strong>{WEAPONS[hud.weapon].name}</strong>
              <span>
                {hud.reload > 0
                  ? `Зарядка ${hud.reload.toFixed(1)}с`
                  : WEAPONS[hud.weapon].magazine
                    ? `${hud.ammo} / ${WEAPONS[hud.weapon].magazine}`
                    : "∞"}
              </span>
            </div>
            <div className="battle-touch">
              <div className="battle-touch-actions">
                <button aria-label="Перезарядить на телефоне" onClick={() => api.current.reload()}>
                  <RotateCcw size={16} /> Зарядить
                </button>
                <button
                  aria-label="Рывок на телефоне"
                  disabled={hud.dash > 0}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    controls.current.dash = true;
                  }}
                >
                  <Zap size={16} /> {hud.dash > 0 ? `${hud.dash.toFixed(1)}с` : "Рывок"}
                </button>
              </div>
              {(["move", "aim"] as const).map((kind) => (
                <div
                  key={kind}
                  role="group"
                  aria-label={kind === "move" ? "Стик движения" : "Стик прицела и стрельбы"}
                  className={`battle-stick battle-stick-${kind}`}
                  onPointerDown={(e) => {
                    if (controls.current[kind].id !== null) return;
                    e.preventDefault();
                    controls.current[kind].id = e.pointerId;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    stickMove(kind, e);
                  }}
                  onPointerMove={(e) => stickMove(kind, e)}
                  onPointerUp={(e) => stickUp(kind, e)}
                  onPointerCancel={(e) => stickUp(kind, e)}
                  onLostPointerCapture={(e) => stickUp(kind, e)}
                >
                  <i />
                  <span>{kind === "move" ? "ДВИЖЕНИЕ" : "ОГОНЬ"}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {phase !== "run" && (
          <div className="battle-overlay">
            <div className="battle-dialog">
              <span className="battle-eyebrow">
                {phase === "ready"
                  ? "АРЕНА ВЫЖИВАНИЯ / 2.5D"
                  : phase === "paused"
                    ? "ПЕРЕДЫШКА"
                    : "ОПЕРАЦИЯ ЗАВЕРШЕНА"}
              </span>
              <h2>
                {phase === "ready"
                  ? "Держите оборону."
                  : phase === "paused"
                    ? "Бой на паузе"
                    : "Сектор потерян"}
              </h2>
              <p>
                {phase === "ready"
                  ? "Укрытия, танки и боевые дроны. Зачищайте волны, меняйте оружие и не стойте на месте."
                  : phase === "paused"
                    ? "Продолжите, когда будете готовы."
                    : `Волна ${hud.wave} · ${hud.score} очков · +${Math.floor(hud.score / 18)} монет`}
              </p>
              {phase === "ready" && (
                <div className="battle-instructions">
                  <span>
                    <b>WASD</b> движение
                  </span>
                  <span>
                    <b>Мышь</b> прицел и огонь
                  </span>
                  <span>
                    <b>Shift</b> рывок
                  </span>
                  <span>
                    <b>R</b> перезарядка
                  </span>
                </div>
              )}
              <button
                className="btn-primary"
                onClick={() => (phase === "paused" ? api.current.pause() : api.current.start())}
              >
                <Play size={16} />
                {phase === "ready" ? "В бой" : phase === "paused" ? "Продолжить бой" : "Ещё раз"}
              </button>
              {phase === "ready" && (
                <small>На телефоне: левый стик — движение, правый — прицел и огонь.</small>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="battle-loadout">
        {WEAPON_ORDER.map((id, i) => (
          <button
            key={id}
            className={`battle-weapon ${hud.weapon === id ? "is-active" : ""}`}
            disabled={!hud.available.includes(id)}
            aria-pressed={hud.weapon === id}
            title={WEAPONS[id].blurb}
            onClick={() => api.current.select(id)}
          >
            <span>{i + 1 < 10 ? `0${i + 1}` : i + 1}</span>
            <strong>{WEAPONS[id].name}</strong>
            <small>
              {hud.available.includes(id)
                ? id === hud.weapon
                  ? "В руках"
                  : WEAPONS[id].magazine
                    ? `${WEAPONS[id].magazine} патр.`
                    : "Ближний бой"
                : `С волны ${WEAPONS[id].wave}`}
            </small>
          </button>
        ))}
      </div>
      <div className="battle-footer">
        <p>
          1–9 / колесо — оружие · ЛКМ / пробел — огонь · Esc — пауза
          <br />
          Тяжёлое оружие открывается по волнам. Покупки в профиле дают доступ с первого боя.
        </p>
        <div>
          <button
            className="battle-action"
            disabled={phase !== "run"}
            onClick={() => api.current.reload()}
          >
            <RotateCcw size={16} />
            Зарядить
          </button>
          <button
            className="battle-action"
            disabled={phase !== "run" || hud.dash > 0}
            onPointerDown={(e) => {
              e.preventDefault();
              controls.current.dash = true;
            }}
            onClick={(e) => {
              if (e.detail === 0) controls.current.dash = true;
            }}
          >
            <Zap size={16} />
            {hud.dash > 0 ? `${hud.dash.toFixed(1)}с` : "Рывок"}
          </button>
        </div>
      </div>
    </section>
  );
}
