import { ARENA, COVERS, type Battle, type Point, type Enemy } from "./engine.ts";
export const VIEW = { w: 1100, h: 660 };
export const DEPTH = 0.68;
export function camera(game: Battle, view = VIEW) {
  return { x: game.player.x - view.w / 2, y: game.player.y - view.h / (2 * DEPTH) };
}
export function worldPoint(p: Point, game: Battle, view = VIEW) {
  const c = camera(game, view);
  return { x: p.x + c.x, y: (p.y + 22) / DEPTH + c.y };
}

export function render(
  ctx: CanvasRenderingContext2D,
  game: Battle,
  aim: Point | null,
  view = VIEW,
) {
  const cam = camera(game, view);
  const project = (x: number, y: number, z = 0) => ({ x: x - cam.x, y: (y - cam.y) * DEPTH - z });
  const poly = (points: Point[], color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();
  };
  const box = (
    x: number,
    y: number,
    w: number,
    h: number,
    z: number,
    top: string,
    front: string,
    side: string,
  ) => {
    const a = project(x, y),
      b = project(x + w, y),
      c = project(x + w, y + h),
      d = project(x, y + h);
    const lift = (p: Point) => ({ x: p.x - z * 0.16, y: p.y - z });
    poly([a, b, c, d], side);
    poly([b, c, lift(c), lift(b)], side);
    poly([d, c, lift(c), lift(d)], front);
    poly([lift(a), lift(b), lift(c), lift(d)], top);
  };
  const ellipse = (p: Point, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, x, y, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  ctx.clearRect(0, 0, view.w, view.h);
  ctx.fillStyle = "#151e22";
  ctx.fillRect(0, 0, view.w, view.h);
  poly(
    [project(0, 0), project(ARENA.w, 0), project(ARENA.w, ARENA.h), project(0, ARENA.h)],
    "#303e3c",
  );
  ctx.strokeStyle = "#3a4945";
  ctx.lineWidth = 1;
  for (let x = 0; x <= ARENA.w; x += 60) {
    const a = project(x, 0),
      b = project(x, ARENA.h);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  for (let y = 0; y <= ARENA.h; y += 60) {
    const a = project(0, y),
      b = project(ARENA.w, y);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  // Painted courtyard markings and the perimeter establish world scale.
  const center = project(900, 600);
  ctx.strokeStyle = "#7c857066";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, 180, 180 * DEPTH, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = "bold 26px monospace";
  ctx.fillStyle = "#acb99b55";
  ctx.fillText("СЕКТОР 124", center.x - 100, center.y + 12);
  for (let x = 0; x < ARENA.w; x += 120) {
    box(x, 0, 112, 18, 28, "#778477", "#455650", "#34423e");
    box(x, ARENA.h - 18, 112, 18, 28, "#778477", "#455650", "#34423e");
  }
  for (let y = 120; y < ARENA.h - 100; y += 120) {
    box(0, y, 18, 110, 28, "#778477", "#455650", "#34423e");
    box(ARENA.w - 18, y, 18, 110, 28, "#778477", "#455650", "#34423e");
  }
  for (const c of COVERS) {
    const p = project(c.x, c.y + c.h);
    poly(
      [
        p,
        project(c.x + c.w, c.y + c.h),
        project(c.x + c.w + 40, c.y + c.h + 40),
        project(c.x + 30, c.y + c.h + 40),
      ],
      "#14221c66",
    );
  }
  for (const p of game.pickups) {
    const pos = project(p.x, p.y, 8 + Math.sin(game.time * 3) * 3);
    ellipse(project(p.x, p.y), 16, 8, "#15252288");
    ctx.fillStyle = "#7ce7cf";
    ctx.fillRect(pos.x - 10, pos.y - 10, 20, 20);
    ctx.fillStyle = "#173b32";
    ctx.fillRect(pos.x - 6, pos.y - 2, 12, 4);
    ctx.fillRect(pos.x - 2, pos.y - 6, 4, 12);
  }
  const character = (actor: Point & { angle: number }, enemy?: Enemy) => {
    const pos = project(actor.x, actor.y);
    const tank = enemy?.kind === "tank",
      drone = enemy?.kind === "drone";
    ellipse(pos, tank ? 34 : 19, tank ? 17 : 9, "#101d1b88");
    const color = enemy ? (enemy.flash > 0 ? "#f6e7cc" : "#c97861") : "#7ce7cf";
    if (drone) {
      const h = 42 + Math.sin(game.time * 5) * 4;
      const p = project(actor.x, actor.y, h);
      ctx.strokeStyle = "#354747";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(p.x - 22, p.y - 8);
      ctx.lineTo(p.x + 22, p.y + 8);
      ctx.moveTo(p.x + 22, p.y - 8);
      ctx.lineTo(p.x - 22, p.y + 8);
      ctx.stroke();
      for (const dx of [-22, 22])
        for (const dy of [-8, 8]) ellipse({ x: p.x + dx, y: p.y + dy }, 12, 4, "#b8c3b999");
      ellipse(p, 11, 8, color);
    } else if (tank) {
      box(actor.x - 29, actor.y - 23, 14, 52, 16, "#58635c", "#293632", "#1c2927");
      box(actor.x + 15, actor.y - 23, 14, 52, 16, "#58635c", "#293632", "#1c2927");
      box(actor.x - 22, actor.y - 20, 44, 42, 24, color, "#744a3d", "#503c34");
      ellipse(project(actor.x, actor.y, 30), 16, 12, color);
    } else {
      const stride = Math.sin(game.time * 10) * 3;
      box(actor.x - 10, actor.y - 5 + stride, 8, 12, 12, "#364b4a", "#192f31", "#213b39");
      box(actor.x + 3, actor.y - 5 - stride, 8, 12, 12, "#364b4a", "#192f31", "#213b39");
      box(actor.x - 12, actor.y - 9, 24, 18, 30, color, enemy ? "#865744" : "#3e897b", "#315e56");
      ellipse(project(actor.x, actor.y, 41), 10, 9, enemy ? "#9d7560" : "#ded2b7");
      ellipse(project(actor.x - 2, actor.y - 2, 45), 11, 6, enemy ? "#6d5549" : "#315c55");
    }
    const muzzle = project(
      actor.x + Math.cos(actor.angle) * (tank ? 46 : 30),
      actor.y + Math.sin(actor.angle) * (tank ? 46 : 30),
      tank ? 30 : drone ? 42 : 24,
    );
    const hand = project(actor.x, actor.y, tank ? 30 : drone ? 42 : 24);
    ctx.strokeStyle = enemy ? "#432f29" : "#172f30";
    ctx.lineWidth = tank ? 9 : 6;
    ctx.beginPath();
    ctx.moveTo(hand.x, hand.y);
    ctx.lineTo(muzzle.x, muzzle.y);
    ctx.stroke();
    if (!enemy) {
      ctx.strokeStyle = game.invincible > 0 ? "#effff5" : "#7ce7cf88";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 24, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (enemy) {
      const p = project(actor.x, actor.y, drone ? 65 : tank ? 52 : 64);
      ctx.fillStyle = "#162523";
      ctx.fillRect(p.x - 18, p.y, 36, 4);
      ctx.fillStyle = "#e2977d";
      ctx.fillRect(p.x - 18, p.y, 36 * Math.max(0, enemy.hp / enemy.max), 4);
    }
  };
  const objects = [
    ...COVERS.map((b, i) => ({
      y: b.y + b.h,
      draw: () => {
        box(b.x, b.y, b.w, b.h, b.z, "#899483", "#526558", "#354c43");
        const p = project(b.x + 14, b.y + b.h, b.z - 20);
        ctx.fillStyle = "#c6c9ad";
        ctx.font = "bold 12px monospace";
        ctx.fillText(`124 / 0${i + 1}`, p.x - b.z * 0.16, p.y);
        for (let x = 20; x < b.w - 10; x += 40)
          box(b.x + x, b.y + 12, 22, b.h - 24, b.z + 3, "#9ca38b", "#60705f", "#455744");
      },
    })),
    ...game.enemies.map((e) => ({ y: e.y, draw: () => character(e, e) })),
    { y: game.player.y, draw: () => character(game.player) },
  ].sort((a, b) => a.y - b.y);
  for (const object of objects) object.draw();
  for (const d of game.drones) {
    const p = project(d.x, d.y, 42);
    ellipse(project(d.x, d.y), 12, 5, "#18272366");
    ellipse(p, 10, 6, "#96caff");
    ctx.strokeStyle = "#cde8ec";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x - 18, p.y);
    ctx.lineTo(p.x + 18, p.y);
    ctx.stroke();
  }
  for (const b of game.bullets) {
    const p = project(b.x, b.y, 22);
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.r;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x - b.vx * 0.015, p.y - b.vy * 0.015 * DEPTH);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  for (const e of game.effects) {
    const p = project(e.x, e.y, 22);
    ctx.globalAlpha = Math.max(0, e.life / e.max);
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(
      p.x,
      p.y,
      e.radius * (1 - e.life / e.max) + 4,
      (e.radius * (1 - e.life / e.max) + 4) * DEPTH,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.lineCap = "butt";
  if (aim && game.phase === "run") {
    ctx.strokeStyle = "#e6f3e3";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(aim.x, aim.y, 9, 0, Math.PI * 2);
    ctx.moveTo(aim.x - 15, aim.y);
    ctx.lineTo(aim.x - 5, aim.y);
    ctx.moveTo(aim.x + 5, aim.y);
    ctx.lineTo(aim.x + 15, aim.y);
    ctx.moveTo(aim.x, aim.y - 15);
    ctx.lineTo(aim.x, aim.y - 5);
    ctx.moveTo(aim.x, aim.y + 5);
    ctx.lineTo(aim.x, aim.y + 15);
    ctx.stroke();
  }
  // Radar stays readable while the camera follows the player.
  const mx = view.w - 164,
    my = 18,
    s = 0.08;
  ctx.fillStyle = "#101e20dd";
  ctx.fillRect(mx - 8, my - 8, 160, 112);
  ctx.strokeStyle = "#7c998577";
  ctx.strokeRect(mx, my, ARENA.w * s, ARENA.h * s);
  for (const b of COVERS) {
    ctx.fillStyle = "#788777";
    ctx.fillRect(mx + b.x * s, my + b.y * s, b.w * s, b.h * s);
  }
  for (const e of game.enemies) {
    ctx.fillStyle = "#f17866";
    ctx.fillRect(mx + e.x * s - 2, my + e.y * s - 2, 4, 4);
  }
  ctx.fillStyle = "#7ce7cf";
  ctx.fillRect(mx + game.player.x * s - 3, my + game.player.y * s - 3, 6, 6);
}
