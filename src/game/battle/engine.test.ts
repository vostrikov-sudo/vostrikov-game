import { test } from "node:test";
import assert from "node:assert/strict";
import { Battle, COVERS, blocked, move, type Enemy, type Input } from "./engine.ts";
import { WEAPONS, WEAPON_ORDER } from "../../lib/weapons.ts";
const idle: Input = { x: 0, y: 0, angle: 0, fire: false, dash: false };
function arena() {
  const b = new Battle({}, [], () => 0.5);
  b.phase = "run";
  b.spawnLeft = 999;
  return b;
}
function enemy(x: number, y: number, hp = 50): Enemy {
  return { x, y, r: 17, angle: 0, kind: "soldier", hp, max: hp, cooldown: 999, flash: 0 };
}
function ticks(b: Battle, seconds: number, input = idle) {
  for (let i = 0; i < Math.ceil(seconds * 60); i++) b.step(1 / 60, input);
}

test("WASD signs, normalized diagonal movement, pause and cover during dash", () => {
  const left = arena(),
    right = arena(),
    diagonal = arena();
  ticks(left, 0.2, { ...idle, x: -1 });
  ticks(right, 0.2, { ...idle, x: 1 });
  ticks(diagonal, 0.2, { ...idle, x: 1, y: -1 });
  assert.ok(left.player.x < 900);
  assert.ok(right.player.x > 900);
  assert.ok(diagonal.player.y < 850);
  assert.ok(
    Math.abs(
      Math.hypot(diagonal.player.x - 900, diagonal.player.y - 850) - (right.player.x - 900),
    ) < 0.01,
  );
  left.phase = "paused";
  const x = left.player.x;
  ticks(left, 1, { ...idle, x: -1, fire: true });
  assert.equal(left.player.x, x);
  assert.equal(left.ammo.pistol, 14);
  const cover = COVERS[0];
  const actor = { x: cover.x - 40, y: cover.y + 30, r: 18, angle: 0 };
  move(actor, 500, 0);
  assert.ok(actor.x < cover.x);
  assert.equal(blocked(actor.x, actor.y, actor.r), false);
});
test("reload takes time, switching cancels it without bypassing cooldown", () => {
  const b = arena();
  b.shoot();
  assert.equal(b.ammo.pistol, 13);
  b.reload();
  b.shoot();
  assert.equal(b.ammo.pistol, 13);
  ticks(b, 0.5);
  assert.equal(b.ammo.pistol, 13);
  ticks(b, 0.6);
  assert.equal(b.ammo.pistol, 14);
  b.shoot();
  b.reload();
  b.select("shotgun");
  assert.equal(b.reloadLeft, 0);
  b.shoot();
  assert.equal(b.ammo.shotgun, 6);
  ticks(b, 0.2);
  b.shoot();
  assert.equal(b.ammo.shotgun, 5);
  assert.ok(b.bullets.length >= 7);
});
test("fast bullets cannot tunnel through a target and hit only once", () => {
  const b = arena();
  b.wave = 4;
  b.select("sniper");
  b.player = { x: 600, y: 700, r: 18, angle: 0 };
  b.enemies = [enemy(650, 700), enemy(690, 700)];
  b.shoot();
  ticks(b, 0.06);
  assert.equal(b.kills, 1);
  assert.equal(b.score, 40);
  assert.equal(b.enemies.length, 1);
  assert.equal(b.enemies[0].hp, 50);
});
test("cover stops both friendly and hostile projectiles", () => {
  const b = arena();
  b.player = { x: 270, y: 290, r: 18, angle: 0 };
  b.enemies = [enemy(570, 290)];
  b.shoot();
  b.bullets.push({
    x: 570,
    y: 290,
    vx: -1800,
    vy: 0,
    life: 1,
    damage: 100,
    splash: 0,
    hostile: true,
    color: "red",
    r: 3,
  });
  ticks(b, 0.4);
  assert.equal(b.hp, 100);
  assert.equal(b.enemies[0].hp, 50);
  assert.equal(b.bullets.length, 0);
});
test("explosion rewards every kill exactly once", () => {
  const b = arena();
  b.wave = 3;
  b.select("rocket");
  b.player = { x: 600, y: 700, r: 18, angle: 0 };
  b.enemies = [enemy(650, 700, 30), enemy(668, 735, 30)];
  b.shoot();
  ticks(b, 0.2);
  assert.equal(b.kills, 2);
  assert.equal(b.score, 80);
  ticks(b, 0.5);
  assert.equal(b.score, 80);
});
test("wave break clears hostile shots, heals and unlocks weapons", () => {
  const b = arena();
  assert.equal(b.available("cannon"), false);
  b.remaining = 0;
  b.hp = 40;
  b.step(1 / 60, idle);
  assert.equal(b.hp, 60);
  assert.ok(b.intermission > 0);
  ticks(b, 4);
  assert.equal(b.wave, 2);
  assert.ok(b.remaining > 0);
  assert.equal(b.available("cannon"), true);
  assert.equal(b.available("sniper"), false);
  const owned = new Battle({}, ["sniper"]);
  assert.equal(owned.available("sniper"), true);
});
test("drones are bounded and damage targets; all nine weapons work", () => {
  const b = arena();
  b.wave = 5;
  b.select("drones");
  b.player = { x: 600, y: 700, r: 18, angle: 0 };
  b.enemies = [enemy(680, 700, 1000)];
  b.shoot();
  ticks(b, 1);
  assert.ok(b.enemies[0].hp < 1000);
  assert.equal(b.drones.length, 1);
  for (const id of WEAPON_ORDER) {
    const g = arena();
    g.wave = 5;
    g.select(id);
    g.player = { x: 600, y: 700, r: 18, angle: 0 };
    g.enemies = [enemy(650, 700, 1000)];
    g.shoot();
    ticks(g, 0.4);
    assert.ok(g.enemies[0].hp < 1000, `${id} should deal damage`);
    assert.ok(WEAPONS[id].fireInterval > 0);
  }
});
test("death freezes combat and cannot be undone by a health pickup", () => {
  const b = arena();
  b.hp = 1;
  b.enemies = [enemy(b.player.x, b.player.y)];
  b.pickups = [{ ...b.player, life: 20 }];
  b.step(1 / 60, idle);
  assert.equal(b.phase, "over");
  assert.equal(b.hp, 0);
  const t = b.time;
  ticks(b, 1);
  assert.equal(b.time, t);
});
