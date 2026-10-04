import {
  STARTER_WEAPONS,
  WEAPONS,
  WEAPON_ORDER,
  weaponDamage,
  type WeaponId,
} from "../../lib/weapons.ts";

export const ARENA = { w: 1800, h: 1200 };
export const COVERS = [
  { x: 330, y: 250, w: 180, h: 90, z: 68 },
  { x: 1180, y: 220, w: 220, h: 100, z: 85 },
  { x: 700, y: 420, w: 120, h: 120, z: 60 },
  { x: 1050, y: 740, w: 130, h: 120, z: 60 },
  { x: 300, y: 860, w: 210, h: 90, z: 75 },
  { x: 1370, y: 860, w: 170, h: 100, z: 65 },
];
export type Point = { x: number; y: number };
export type Actor = Point & { r: number; angle: number };
export type Enemy = Actor & {
  kind: "soldier" | "tank" | "drone";
  hp: number;
  max: number;
  cooldown: number;
  flash: number;
};
export type Bullet = Point & {
  vx: number;
  vy: number;
  life: number;
  damage: number;
  splash: number;
  hostile: boolean;
  color: string;
  r: number;
};
export type Effect = Point & { life: number; max: number; radius: number; color: string };
export type Input = { x: number; y: number; angle: number; fire: boolean; dash: boolean };
export type Phase = "ready" | "run" | "paused" | "over";
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function blocked(x: number, y: number, r = 0) {
  return (
    x < r ||
    y < r ||
    x > ARENA.w - r ||
    y > ARENA.h - r ||
    COVERS.some((b) => x > b.x - r && x < b.x + b.w + r && y > b.y - r && y < b.y + b.h + r)
  );
}
export function move(actor: Actor, dx: number, dy: number) {
  // Small steps keep a dash or fast projectile from crossing thin cover.
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 6));
  for (let i = 0; i < steps; i++) {
    if (!blocked(actor.x + dx / steps, actor.y, actor.r)) actor.x += dx / steps;
    if (!blocked(actor.x, actor.y + dy / steps, actor.r)) actor.y += dy / steps;
  }
}
export function clearLine(a: Point, b: Point, radius = 0) {
  const n = Math.ceil(distance(a, b) / 8);
  for (let i = 1; i <= n; i++)
    if (blocked(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n, radius)) return false;
  return true;
}

export class Battle {
  phase: Phase = "ready";
  player: Actor = { x: 900, y: 850, r: 18, angle: -Math.PI / 2 };
  hp = 100;
  score = 0;
  kills = 0;
  wave = 1;
  weapon: WeaponId = "pistol";
  ammo = Object.fromEntries(WEAPON_ORDER.map((id) => [id, WEAPONS[id].magazine])) as Record<
    WeaponId,
    number
  >;
  reloadLeft = 0;
  fireLeft = 0;
  dashLeft = 0;
  dashTime = 0;
  invincible = 0;
  time = 0;
  intermission = 0;
  spawnLeft = 1;
  remaining = 7;
  enemies: Enemy[] = [];
  bullets: Bullet[] = [];
  effects: Effect[] = [];
  pickups: (Point & { life: number })[] = [];
  drones: (Point & { life: number; cooldown: number })[] = [];
  private flow = new Map<string, number>();
  private flowLeft = 0;
  levels: Partial<Record<WeaponId, number>>;
  owned: WeaponId[];
  private random: () => number;
  constructor(
    levels: Partial<Record<WeaponId, number>> = {},
    owned: WeaponId[] = [],
    random = Math.random,
  ) {
    this.levels = levels;
    this.owned = owned;
    this.random = random;
  }

  available(id: WeaponId) {
    return STARTER_WEAPONS.includes(id) || this.owned.includes(id) || this.wave >= WEAPONS[id].wave;
  }
  select(id: WeaponId) {
    if (!this.available(id) || this.weapon === id) return;
    this.weapon = id;
    this.reloadLeft = 0;
    // Preserve the shot cooldown: switching cannot bypass a slow weapon's rate.
  }
  reload() {
    const def = WEAPONS[this.weapon];
    if (
      this.phase === "run" &&
      def.magazine &&
      this.ammo[this.weapon] < def.magazine &&
      !this.reloadLeft
    )
      this.reloadLeft = def.reload;
  }
  effect(p: Point, radius: number, color: string, life = 0.25) {
    if (this.effects.length < 100) this.effects.push({ ...p, radius, color, life, max: life });
  }
  private damagePlayer(n: number) {
    if (this.invincible > 0 || this.phase !== "run") return;
    this.hp = Math.max(0, this.hp - n);
    this.invincible = 0.5;
    this.effect(this.player, 42, "#f17866");
    if (!this.hp) this.phase = "over";
  }
  private projectile(
    origin: Point,
    angle: number,
    damage: number,
    speed: number,
    range: number,
    splash: number,
    hostile = false,
    color = "#7ce7cf",
  ) {
    if (this.bullets.length >= 300) return;
    this.bullets.push({
      ...origin,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage,
      life: range / speed,
      splash,
      hostile,
      color,
      r: splash ? 6 : 3,
    });
  }
  shoot() {
    if (this.phase !== "run" || this.fireLeft > 0 || this.reloadLeft > 0) return;
    const id = this.weapon,
      def = WEAPONS[id];
    if (def.magazine && this.ammo[id] <= 0) {
      this.reload();
      return;
    }
    if (id === "drones" && this.drones.length >= 3) return;
    const damage = weaponDamage(id, this.levels[id] ?? 1);
    this.fireLeft = def.fireInterval;
    if (def.magazine) this.ammo[id]--;
    if (id === "sword") {
      const tip = {
        x: this.player.x + Math.cos(this.player.angle) * 45,
        y: this.player.y + Math.sin(this.player.angle) * 45,
      };
      this.effect(tip, 48, "#e6dac2");
      for (const e of this.enemies)
        if (distance(e, tip) < 48 + e.r && clearLine(this.player, e)) {
          e.hp -= damage;
          e.flash = 0.12;
        }
    } else if (id === "drones") {
      this.drones.push({ x: this.player.x, y: this.player.y, life: 16, cooldown: 0 });
    } else {
      for (let i = 0; i < def.pellets; i++) {
        const angle = this.player.angle + (this.random() - 0.5) * def.spread * 2;
        this.projectile(
          this.player,
          angle,
          damage,
          def.projectileSpeed,
          def.range,
          def.splash,
          false,
          id === "plasma" ? "#96caff" : "#7ce7cf",
        );
      }
      this.effect(
        {
          x: this.player.x + Math.cos(this.player.angle) * 27,
          y: this.player.y + Math.sin(this.player.angle) * 27,
        },
        12,
        "#f1dcab",
        0.08,
      );
    }
  }
  private spawn() {
    for (let tries = 0; tries < 30; tries++) {
      const edge = Math.floor(this.random() * 4);
      const p = {
        x: edge < 2 ? (edge ? ARENA.w - 65 : 65) : 65 + this.random() * (ARENA.w - 130),
        y: edge >= 2 ? (edge === 2 ? 65 : ARENA.h - 65) : 65 + this.random() * (ARENA.h - 130),
      };
      if (distance(p, this.player) < 480 || blocked(p.x, p.y, 30)) continue;
      const roll = this.random();
      const kind = this.wave > 1 && roll < 0.24 ? "tank" : roll > 0.72 ? "drone" : "soldier";
      const hp =
        (kind === "tank" ? 160 : kind === "drone" ? 32 : 55) * (1 + (this.wave - 1) * 0.16);
      this.enemies.push({
        ...p,
        r: kind === "tank" ? 28 : 17,
        angle: 0,
        hp,
        max: hp,
        kind,
        cooldown: 1.6,
        flash: 0,
      });
      this.remaining--;
      return;
    }
  }
  private updateFlow() {
    // A small four-neighbour flow field routes ground enemies around cover.
    this.flow.clear();
    const cell = 60,
      cols = ARENA.w / cell,
      rows = ARENA.h / cell;
    const queue = [{ x: Math.floor(this.player.x / cell), y: Math.floor(this.player.y / cell) }];
    this.flow.set(`${queue[0].x},${queue[0].y}`, 0);
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i],
        d = this.flow.get(`${p.x},${p.y}`)!;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const x = p.x + dx,
          y = p.y + dy,
          key = `${x},${y}`;
        if (
          x < 0 ||
          y < 0 ||
          x >= cols ||
          y >= rows ||
          this.flow.has(key) ||
          blocked(x * cell + 30, y * cell + 30, 29)
        )
          continue;
        this.flow.set(key, d + 1);
        queue.push({ x, y });
      }
    }
  }
  private destination(e: Enemy): Point {
    if (clearLine(e, this.player, e.r)) return this.player;
    const x = Math.floor(e.x / 60),
      y = Math.floor(e.y / 60);
    let best = Infinity,
      dest: Point = { x: x * 60 + 30, y: y * 60 + 30 };
    for (const [dx, dy] of [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const value = this.flow.get(`${x + dx},${y + dy}`) ?? Infinity;
      if (value < best) {
        best = value;
        dest = { x: (x + dx) * 60 + 30, y: (y + dy) * 60 + 30 };
      }
    }
    return dest;
  }
  step(dt: number, input: Input) {
    if (this.phase !== "run") return;
    this.time += dt;
    this.player.angle = input.angle;
    this.fireLeft = Math.max(0, this.fireLeft - dt);
    this.invincible = Math.max(0, this.invincible - dt);
    this.dashLeft = Math.max(0, this.dashLeft - dt);
    this.dashTime = Math.max(0, this.dashTime - dt);
    if (this.reloadLeft > 0) {
      this.reloadLeft = Math.max(0, this.reloadLeft - dt);
      if (!this.reloadLeft) this.ammo[this.weapon] = WEAPONS[this.weapon].magazine;
    }
    const length = Math.hypot(input.x, input.y),
      scale = Math.max(1, length);
    if (input.dash && !this.dashLeft && length > 0.15) {
      this.dashLeft = 2.4;
      this.dashTime = 0.16;
      this.invincible = 0.22;
    }
    const speed = this.dashTime > 0 ? 740 : 240;
    move(this.player, (input.x / scale) * speed * dt, (input.y / scale) * speed * dt);
    if (input.fire) this.shoot();
    this.flowLeft -= dt;
    if (this.flowLeft <= 0) {
      this.updateFlow();
      this.flowLeft = 0.4;
    }
    for (const e of this.enemies) {
      const d = distance(e, this.player);
      e.angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      e.flash = Math.max(0, e.flash - dt);
      const sight = clearLine(e, this.player);
      const dest = e.kind === "drone" ? this.player : this.destination(e);
      const a = Math.atan2(dest.y - e.y, dest.x - e.x);
      if (d > (e.kind === "tank" ? 260 : 160) || !sight) {
        const speed = e.kind === "tank" ? 62 : e.kind === "drone" ? 118 : 92;
        if (e.kind === "drone") {
          e.x += Math.cos(a) * speed * dt;
          e.y += Math.sin(a) * speed * dt;
        } else move(e, Math.cos(a) * speed * dt, Math.sin(a) * speed * dt);
      }
      for (const other of this.enemies) {
        const sep = distance(e, other);
        if (other !== e && sep > 0 && sep < e.r + other.r + 6)
          move(e, ((e.x - other.x) / sep) * 35 * dt, ((e.y - other.y) / sep) * 35 * dt);
      }
      if (d < e.r + this.player.r) this.damagePlayer(12);
      e.cooldown -= dt;
      if (e.cooldown <= 0 && d < 650 && sight) {
        e.cooldown = e.kind === "tank" ? 2.3 : 1.8;
        this.projectile(
          e,
          e.angle,
          e.kind === "tank" ? 22 : 10,
          e.kind === "tank" ? 240 : 290,
          700,
          0,
          true,
          "#f17866",
        );
      }
    }
    for (const b of this.bullets) {
      const travel = Math.min(dt, b.life),
        n = Math.max(1, Math.ceil((Math.hypot(b.vx, b.vy) * travel) / 6));
      for (let i = 0; i < n && b.life > 0; i++) {
        b.x += (b.vx * travel) / n;
        b.y += (b.vy * travel) / n;
        const wall = blocked(b.x, b.y, b.r);
        const target =
          !wall && !b.hostile
            ? this.enemies.find((e) => e.hp > 0 && distance(e, b) < e.r + b.r)
            : undefined;
        const playerHit = !wall && b.hostile && distance(this.player, b) < this.player.r + b.r;
        if (wall || target || playerHit) {
          b.life = 0;
          if (playerHit) this.damagePlayer(b.damage);
          if (target) {
            target.hp -= b.damage;
            target.flash = 0.12;
          }
          if (!b.hostile && b.splash)
            for (const e of this.enemies) {
              if (e !== target && distance(e, b) < b.splash + e.r && clearLine(e, b)) {
                e.hp -= b.damage * 0.65;
                e.flash = 0.12;
              }
            }
          this.effect(b, b.splash || 12, b.color);
        }
      }
      b.life -= dt;
    }
    this.bullets = this.bullets.filter((b) => b.life > 0);
    for (let i = 0; i < this.drones.length; i++) {
      const d = this.drones[i];
      d.life -= dt;
      d.cooldown -= dt;
      const a = this.time * 1.7 + (i * Math.PI * 2) / 3;
      d.x = this.player.x + Math.cos(a) * 58;
      d.y = this.player.y + Math.sin(a) * 58;
      const target = this.enemies
        .filter((e) => e.hp > 0 && distance(d, e) < 450 && clearLine(d, e))
        .sort((a, b) => distance(d, a) - distance(d, b))[0];
      if (target && d.cooldown <= 0) {
        this.projectile(
          d,
          Math.atan2(target.y - d.y, target.x - d.x),
          weaponDamage("drones", this.levels.drones ?? 1),
          650,
          500,
          0,
        );
        d.cooldown = 0.4;
      }
    }
    this.drones = this.drones.filter((d) => d.life > 0);
    for (const e of this.enemies)
      if (e.hp <= 0) {
        this.kills++;
        this.score += e.kind === "tank" ? 100 : 40;
        this.effect(e, e.r * 2, "#e3c398", 0.4);
        if (this.random() < 0.2 && !blocked(e.x, e.y, 18))
          this.pickups.push({ x: e.x, y: e.y, life: 20 });
      }
    this.enemies = this.enemies.filter((e) => e.hp > 0);
    for (const p of this.pickups) {
      p.life -= dt;
      if (this.phase === "run" && distance(p, this.player) < 34) {
        this.hp = Math.min(100, this.hp + 25);
        p.life = 0;
      }
    }
    this.pickups = this.pickups.filter((p) => p.life > 0);
    for (const e of this.effects) e.life -= dt;
    this.effects = this.effects.filter((e) => e.life > 0);
    if (this.phase !== "run") return;
    this.spawnLeft -= dt;
    if (this.remaining > 0 && this.spawnLeft <= 0 && this.enemies.length < 22) {
      this.spawn();
      this.spawnLeft = Math.max(0.5, 1.3 - this.wave * 0.08);
    }
    if (!this.remaining && !this.enemies.length) {
      if (!this.intermission) {
        this.intermission = 4;
        this.hp = Math.min(100, this.hp + 20);
        this.bullets = [];
      }
      this.intermission -= dt;
      if (this.intermission <= 0) {
        this.intermission = 0;
        this.wave++;
        this.remaining = 5 + this.wave * 2;
        this.spawnLeft = 1;
      }
    }
  }
}
