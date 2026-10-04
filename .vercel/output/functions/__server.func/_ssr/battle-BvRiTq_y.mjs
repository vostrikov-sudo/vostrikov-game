import { i as __toESM } from "../_runtime.mjs";
import { i as weaponDamage, n as WEAPON_ORDER, t as WEAPONS } from "./weapons-HFaUkYTd.mjs";
import { J as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as useProfile } from "./router--JjdGKzB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/battle-BvRiTq_y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var VW = 960;
var VH = 540;
var WW = 2400;
var WH = 1600;
var BUILDINGS = [
	{
		x: 980,
		y: 520,
		w: 420,
		h: 280
	},
	{
		x: 320,
		y: 260,
		w: 220,
		h: 180
	},
	{
		x: 1760,
		y: 240,
		w: 260,
		h: 200
	},
	{
		x: 1680,
		y: 980,
		w: 300,
		h: 220
	},
	{
		x: 280,
		y: 1080,
		w: 240,
		h: 190
	}
];
var TREES = [
	[180, 180],
	[620, 140],
	[2100, 160],
	[140, 720],
	[1280, 200],
	[2200, 700],
	[900, 1300],
	[2100, 1400],
	[1500, 1480],
	[480, 1480]
];
function BattleGame() {
	const canvasRef = (0, import_react.useRef)(null);
	const stickRef = (0, import_react.useRef)(null);
	const profile = useProfile();
	const [phase, setPhase] = (0, import_react.useState)("ready");
	const [hud, setHud] = (0, import_react.useState)({
		score: 0,
		wave: 1,
		hp: 100,
		weapon: "sword"
	});
	const api = (0, import_react.useRef)({
		start: () => {},
		setWeapon: (_w) => {},
		fire: () => {}
	});
	const unlocked = profile.unlocked;
	const levels = profile.levels;
	(0, import_react.useEffect)(() => {
		const canvasEl = canvasRef.current;
		if (!canvasEl) return;
		const stage = canvasEl;
		const gfx = stage.getContext("2d");
		const imgs = {
			hero: load("/photos/character.png"),
			grass: load("/game/grass.jpg"),
			yard: load("/game/yard.jpg"),
			school: load("/game/school.png"),
			tree: load("/game/tree.png"),
			tank: load("/game/tank.png"),
			drone: load("/game/drone.png")
		};
		let running = false;
		let acc = 0;
		let last = performance.now();
		let score = 0;
		let wave = 1;
		let hp = 100;
		let inv = 0;
		let weapon = unlocked.includes("pistol") ? "pistol" : "sword";
		let fireCd = 0;
		let spawnT = 0;
		let shake = 0;
		const player = {
			x: WW / 2,
			y: WH * .72,
			r: 22,
			ang: 0
		};
		const cam = {
			x: 0,
			y: 0
		};
		const move = {
			x: 0,
			y: 0
		};
		const mouse = {
			x: VW / 2,
			y: VH / 2,
			down: false,
			worldX: 0,
			worldY: 0
		};
		const keys = /* @__PURE__ */ new Set();
		let injected = null;
		const bullets = [];
		let enemies = [];
		const drones = [];
		const pickups = [];
		window.__controlsTest = {
			getYaw: () => player.ang,
			getSpeed: () => Math.hypot(move.x, move.y) * 220,
			setKeys: (codes) => {
				injected = codes;
			}
		};
		function sync() {
			setHud({
				score: Math.floor(score),
				wave,
				hp: Math.max(0, Math.round(hp)),
				weapon
			});
		}
		api.current = {
			start: () => {
				running = true;
				score = 0;
				wave = 1;
				hp = 100;
				inv = 0;
				fireCd = 0;
				spawnT = 0;
				player.x = WW / 2;
				player.y = WH * .72;
				bullets.length = 0;
				enemies = [];
				drones.length = 0;
				pickups.length = 0;
				weapon = unlocked[0] ?? "sword";
				if (unlocked.includes("pistol")) weapon = "pistol";
				setPhase("run");
				sync();
			},
			setWeapon: (w) => {
				if (unlocked.includes(w)) weapon = w;
				sync();
			},
			fire: () => shoot()
		};
		function blocked(x, y, r) {
			if (x < r || y < r || x > WW - r || y > WH - r) return true;
			for (const b of BUILDINGS) if (x > b.x - r && x < b.x + b.w + r && y > b.y - r && y < b.y + b.h + r) return true;
			return false;
		}
		function tryMove(e, dx, dy) {
			const nx = e.x + dx;
			if (!blocked(nx, e.y, e.r)) e.x = nx;
			const ny = e.y + dy;
			if (!blocked(e.x, ny, e.r)) e.y = ny;
		}
		function shoot() {
			if (!running || fireCd > 0) return;
			const def = WEAPONS[weapon];
			const lvl = levels[weapon] ?? 1;
			const dmg = weaponDamage(weapon, lvl);
			fireCd = Math.max(.08, def.fireInterval * (1 - .06 * (lvl - 1)));
			const ang = player.ang;
			const ca = Math.cos(ang);
			const sa = Math.sin(ang);
			if (weapon === "sword") bullets.push({
				x: player.x + ca * 36,
				y: player.y + sa * 36,
				vx: ca * 40,
				vy: sa * 40,
				r: 32,
				dmg,
				life: .12,
				from: "p",
				splash: 0,
				color: "#d8c9a3"
			});
			else if (weapon === "drones") {
				if (drones.length < 3 + Math.min(2, lvl - 1)) drones.push({
					x: player.x,
					y: player.y,
					life: 14,
					cool: 0,
					ang: Math.random() * 6
				});
			} else bullets.push({
				x: player.x + ca * 24,
				y: player.y + sa * 24,
				vx: ca * def.projectileSpeed,
				vy: sa * def.projectileSpeed,
				r: weapon === "rocket" ? 8 : weapon === "cannon" ? 7 : 4,
				dmg,
				life: def.range / def.projectileSpeed,
				from: "p",
				splash: def.splash,
				color: weapon === "rocket" ? "#c45c4a" : weapon === "cannon" ? "#8a7a55" : "#2dd4bf"
			});
		}
		function spawnEnemy() {
			const edge = Math.floor(Math.random() * 4);
			let x = 80;
			let y = 80;
			if (edge === 0) {
				x = 80;
				y = 80 + Math.random() * 1440;
			} else if (edge === 1) {
				x = 2320;
				y = 80 + Math.random() * 1440;
			} else if (edge === 2) {
				x = 80 + Math.random() * 2240;
				y = 80;
			} else {
				x = 80 + Math.random() * 2240;
				y = 1520;
			}
			if (blocked(x, y, 30)) return;
			const roll = Math.random();
			let kind = "soldier";
			if (roll < .34) kind = "tank";
			else if (roll < .62) kind = "drone";
			const stats = kind === "tank" ? {
				r: 28,
				hp: 90 + wave * 18,
				speed: 42 + wave * 2,
				score: 80
			} : kind === "drone" ? {
				r: 16,
				hp: 28 + wave * 6,
				speed: 110,
				score: 40
			} : {
				r: 16,
				hp: 36 + wave * 8,
				speed: 78,
				score: 28
			};
			enemies.push({
				kind,
				x,
				y,
				r: stats.r,
				hp: stats.hp,
				max: stats.hp,
				speed: stats.speed,
				ang: 0,
				cool: 1.2,
				score: stats.score
			});
		}
		function hitPlayer(n) {
			if (inv > 0) return;
			hp -= n;
			inv = .7;
			shake = 8;
			sync();
			if (hp <= 0) {
				running = false;
				useProfile.getState().recordBattle(Math.floor(score), wave);
				useProfile.getState().addXp(Math.floor(score / 20));
				useProfile.getState().addCoins(Math.floor(score / 18));
				setPhase("over");
			}
		}
		function step(dt) {
			if (!running) return;
			const held = injected ?? [...keys];
			const has = (c) => held.includes(c) || keys.has(c);
			let mx = 0;
			let my = 0;
			if (has("KeyW") || has("ArrowUp")) my -= 1;
			if (has("KeyS") || has("ArrowDown")) my += 1;
			if (has("KeyA") || has("ArrowLeft")) mx -= 1;
			if (has("KeyD") || has("ArrowRight")) mx += 1;
			mx += move.x;
			my += move.y;
			const len = Math.hypot(mx, my);
			if (len > 1) {
				mx /= len;
				my /= len;
			} else if (len > .15) {} else {
				mx = 0;
				my = 0;
			}
			tryMove(player, mx * 220 * dt, my * 220 * dt);
			player.ang = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
			inv = Math.max(0, inv - dt);
			fireCd = Math.max(0, fireCd - dt);
			shake = Math.max(0, shake - dt * 24);
			if (mouse.down && weapon !== "sword" && weapon !== "drones") shoot();
			const look = 90;
			cam.x = player.x - VW / 2 + Math.cos(player.ang) * look;
			cam.y = player.y - VH / 2 + Math.sin(player.ang) * look;
			cam.x = Math.max(0, Math.min(1440, cam.x));
			cam.y = Math.max(0, Math.min(1060, cam.y));
			for (let i = bullets.length - 1; i >= 0; i--) {
				const b = bullets[i];
				b.x += b.vx * dt;
				b.y += b.vy * dt;
				b.life -= dt;
				if (b.from === "p" && blocked(b.x, b.y, 4) && weapon !== "sword") b.life = 0;
				if (b.life <= 0) {
					bullets.splice(i, 1);
					continue;
				}
				if (b.from === "e") {
					if (Math.hypot(b.x - player.x, b.y - player.y) < player.r + b.r) {
						hitPlayer(b.dmg);
						bullets.splice(i, 1);
					}
				}
			}
			for (const e of enemies) {
				const dx = player.x - e.x;
				const dy = player.y - e.y;
				const d = Math.hypot(dx, dy) || 1;
				e.ang = Math.atan2(dy, dx);
				const fly = e.kind === "drone";
				const vx = dx / d * e.speed * dt;
				const vy = dy / d * e.speed * dt;
				if (fly) {
					e.x += vx;
					e.y += vy;
				} else tryMove(e, vx, vy);
				for (const o of enemies) {
					if (o === e) continue;
					const ox = e.x - o.x;
					const oy = e.y - o.y;
					const od = Math.hypot(ox, oy);
					if (od < e.r + o.r && od > 0) {
						e.x += ox / od * 20 * dt;
						e.y += oy / od * 20 * dt;
					}
				}
				if (d < e.r + player.r) hitPlayer(e.kind === "tank" ? 14 : 8);
				e.cool -= dt;
				if (e.cool <= 0 && d < 480) {
					e.cool = e.kind === "tank" ? 1.6 : e.kind === "drone" ? 1.1 : 1.4;
					const sp = e.kind === "tank" ? 280 : 340;
					bullets.push({
						x: e.x,
						y: e.y,
						vx: dx / d * sp,
						vy: dy / d * sp,
						r: e.kind === "tank" ? 6 : 4,
						dmg: e.kind === "tank" ? 16 : 8,
						life: 1.8,
						from: "e",
						splash: 0,
						color: "#c45c4a"
					});
				}
			}
			for (const b of bullets) {
				if (b.from !== "p") continue;
				for (let i = enemies.length - 1; i >= 0; i--) {
					const e = enemies[i];
					if (Math.hypot(b.x - e.x, b.y - e.y) < b.r + e.r) {
						const apply = (t) => {
							t.hp -= b.dmg;
						};
						apply(e);
						if (b.splash > 0) {
							for (const o of enemies) if (Math.hypot(o.x - b.x, o.y - b.y) < b.splash) o.hp -= b.dmg * .5;
						}
						b.life = 0;
						if (e.hp <= 0) {
							score += e.score;
							if (Math.random() < .22) pickups.push({
								x: e.x,
								y: e.y,
								kind: Math.random() < .5 ? "heal" : "coin"
							});
							enemies.splice(i, 1);
						}
					}
				}
			}
			enemies = enemies.filter((e) => e.hp > 0);
			for (const d of drones) {
				d.life -= dt;
				d.ang += dt * 1.6;
				let nearest = null;
				let nd = 9999;
				for (const e of enemies) {
					const dd = Math.hypot(e.x - d.x, e.y - d.y);
					if (dd < nd) {
						nd = dd;
						nearest = e;
					}
				}
				if (nearest) {
					const a = Math.atan2(nearest.y - d.y, nearest.x - d.x);
					d.x += Math.cos(a) * 160 * dt;
					d.y += Math.sin(a) * 160 * dt;
					d.cool -= dt;
					if (d.cool <= 0) {
						d.cool = .45;
						const def = WEAPONS.drones;
						bullets.push({
							x: d.x,
							y: d.y,
							vx: Math.cos(a) * def.projectileSpeed,
							vy: Math.sin(a) * def.projectileSpeed,
							r: 3,
							dmg: weaponDamage("drones", levels.drones ?? 1),
							life: .9,
							from: "p",
							splash: 0,
							color: "#7ec8ff"
						});
					}
				} else {
					d.x = player.x + Math.cos(d.ang) * 56;
					d.y = player.y + Math.sin(d.ang) * 56;
				}
			}
			for (let i = drones.length - 1; i >= 0; i--) if (drones[i].life <= 0) drones.splice(i, 1);
			for (let i = pickups.length - 1; i >= 0; i--) {
				const p = pickups[i];
				if (Math.hypot(p.x - player.x, p.y - player.y) < 30) {
					if (p.kind === "heal") hp = Math.min(100, hp + 22);
					else {
						score += 40;
						useProfile.getState().addCoins(8);
					}
					pickups.splice(i, 1);
					sync();
				}
			}
			spawnT -= dt;
			const cap = 5 + wave * 2;
			if (spawnT <= 0 && enemies.length < cap) {
				spawnEnemy();
				spawnT = Math.max(.45, 1.6 - wave * .08);
			}
			if (score > wave * 420) {
				wave += 1;
				sync();
			}
		}
		function draw() {
			const sx = shake ? (Math.random() - .5) * shake : 0;
			const sy = shake ? (Math.random() - .5) * shake : 0;
			gfx.setTransform(1, 0, 0, 1, sx, sy);
			const g = imgs.grass;
			if (g.complete && g.naturalWidth) {
				const ts = 256;
				const x0 = Math.floor(cam.x / ts) * ts;
				const y0 = Math.floor(cam.y / ts) * ts;
				for (let x = x0; x < cam.x + VW + ts; x += ts) for (let y = y0; y < cam.y + VH + ts; y += ts) gfx.drawImage(g, x - cam.x, y - cam.y, ts, ts);
			} else {
				gfx.fillStyle = "#4a7a3a";
				gfx.fillRect(0, 0, VW, VH);
			}
			const yard = imgs.yard;
			if (yard.complete && yard.naturalWidth) {
				gfx.globalAlpha = .92;
				gfx.drawImage(yard, -cam.x, -cam.y, WW, WH);
				gfx.globalAlpha = 1;
			}
			const sch = imgs.school;
			for (const b of BUILDINGS) {
				const x = b.x - cam.x;
				const y = b.y - cam.y;
				if (sch.complete && sch.naturalWidth) gfx.drawImage(sch, x, y, b.w, b.h);
				else {
					gfx.fillStyle = "#c4a35a";
					gfx.fillRect(x, y, b.w, b.h);
				}
			}
			const tr = imgs.tree;
			for (const [tx, ty] of TREES) if (tr.complete && tr.naturalWidth) gfx.drawImage(tr, tx - cam.x - 40, ty - cam.y - 40, 80, 80);
			for (const p of pickups) {
				gfx.beginPath();
				gfx.arc(p.x - cam.x, p.y - cam.y, 10, 0, Math.PI * 2);
				gfx.fillStyle = p.kind === "heal" ? "#e85d4c" : "#d8c9a3";
				gfx.fill();
			}
			for (const b of bullets) {
				gfx.beginPath();
				gfx.arc(b.x - cam.x, b.y - cam.y, b.r, 0, Math.PI * 2);
				gfx.fillStyle = b.color;
				gfx.fill();
			}
			for (const e of enemies) {
				gfx.save();
				gfx.translate(e.x - cam.x, e.y - cam.y);
				gfx.rotate(e.ang);
				if (e.kind === "tank" && imgs.tank.complete) gfx.drawImage(imgs.tank, -e.r * 1.4, -e.r, e.r * 2.8, e.r * 2);
				else if (e.kind === "drone" && imgs.drone.complete) gfx.drawImage(imgs.drone, -e.r, -e.r, e.r * 2, e.r * 2);
				else {
					gfx.fillStyle = "#8b3a32";
					gfx.beginPath();
					gfx.arc(0, 0, e.r, 0, Math.PI * 2);
					gfx.fill();
				}
				gfx.restore();
				gfx.fillStyle = "#1a1a1e";
				gfx.fillRect(e.x - cam.x - 16, e.y - cam.y - e.r - 10, 32, 4);
				gfx.fillStyle = "#2dd4bf";
				gfx.fillRect(e.x - cam.x - 16, e.y - cam.y - e.r - 10, 32 * (e.hp / e.max), 4);
			}
			for (const d of drones) {
				gfx.beginPath();
				gfx.arc(d.x - cam.x, d.y - cam.y, 9, 0, Math.PI * 2);
				gfx.fillStyle = "#7ec8ff";
				gfx.fill();
			}
			gfx.save();
			if (inv > 0 && Math.floor(inv * 14) % 2 === 0) gfx.globalAlpha = .4;
			gfx.translate(player.x - cam.x, player.y - cam.y);
			gfx.rotate(player.ang + Math.PI / 2);
			if (imgs.hero.complete && imgs.hero.naturalWidth) gfx.drawImage(imgs.hero, -22, -30, 44, 60);
			gfx.restore();
			gfx.strokeStyle = "rgba(236,232,225,0.2)";
			gfx.setLineDash([5, 6]);
			gfx.beginPath();
			gfx.moveTo(player.x - cam.x, player.y - cam.y);
			gfx.lineTo(mouse.worldX - cam.x, mouse.worldY - cam.y);
			gfx.stroke();
			gfx.setLineDash([]);
			const mw = 150;
			const mh = 100;
			const mx0 = 798;
			const my0 = 12;
			gfx.fillStyle = "rgba(12,13,16,0.7)";
			gfx.fillRect(mx0, my0, mw, mh);
			gfx.strokeStyle = "rgba(236,232,225,0.2)";
			gfx.strokeRect(mx0, my0, mw, mh);
			const sxm = mw / WW;
			const sym = mh / WH;
			gfx.fillStyle = "#c4a35a";
			for (const b of BUILDINGS) gfx.fillRect(mx0 + b.x * sxm, my0 + b.y * sym, b.w * sxm, b.h * sym);
			gfx.fillStyle = "#e85d4c";
			for (const e of enemies) gfx.fillRect(mx0 + e.x * sxm - 1, my0 + e.y * sym - 1, 3, 3);
			gfx.fillStyle = "#2dd4bf";
			gfx.fillRect(mx0 + player.x * sxm - 2, my0 + player.y * sym - 2, 4, 4);
			gfx.setTransform(1, 0, 0, 1, 0, 0);
		}
		function loop(now) {
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			acc += dt;
			while (acc >= 1 / 60) {
				step(1 / 60);
				acc -= 1 / 60;
			}
			draw();
			raf = requestAnimationFrame(loop);
		}
		function toLocal(ev) {
			const rect = stage.getBoundingClientRect();
			mouse.x = (ev.clientX - rect.left) / rect.width * VW;
			mouse.y = (ev.clientY - rect.top) / rect.height * VH;
			mouse.worldX = cam.x + mouse.x;
			mouse.worldY = cam.y + mouse.y;
		}
		const onKey = (e) => {
			keys.add(e.code);
			if (e.code === "Space") {
				e.preventDefault();
				shoot();
			}
			if (e.code === "Digit1") api.current.setWeapon("sword");
			if (e.code === "Digit2") api.current.setWeapon("pistol");
			if (e.code === "Digit3") api.current.setWeapon("cannon");
			if (e.code === "Digit4") api.current.setWeapon("rocket");
			if (e.code === "Digit5") api.current.setWeapon("drones");
		};
		const onUp = (e) => keys.delete(e.code);
		const onMove = (e) => toLocal(e);
		const onDown = (e) => {
			toLocal(e);
			mouse.down = true;
			shoot();
		};
		const onUpP = () => {
			mouse.down = false;
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("keyup", onUp);
		stage.addEventListener("pointermove", onMove);
		stage.addEventListener("pointerdown", onDown);
		window.addEventListener("pointerup", onUpP);
		const stick = stickRef.current;
		let sid = null;
		const sdown = (e) => {
			sid = e.pointerId;
			smove(e);
		};
		const smove = (e) => {
			if (sid !== null && e.pointerId !== sid) return;
			if (!stick) return;
			const r = stick.getBoundingClientRect();
			const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
			const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
			const l = Math.hypot(dx, dy) || 1;
			const cl = Math.min(1, l);
			move.x = dx / l * cl;
			move.y = dy / l * cl;
		};
		const sup = () => {
			sid = null;
			move.x = 0;
			move.y = 0;
		};
		stick?.addEventListener("pointerdown", sdown);
		window.addEventListener("pointermove", smove);
		window.addEventListener("pointerup", sup);
		let raf = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("keyup", onUp);
			stage.removeEventListener("pointermove", onMove);
			stage.removeEventListener("pointerdown", onDown);
			window.removeEventListener("pointerup", onUpP);
			stick?.removeEventListener("pointerdown", sdown);
			window.removeEventListener("pointermove", smove);
			window.removeEventListener("pointerup", sup);
		};
	}, [levels, unlocked]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto w-full max-w-[960px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap items-center justify-between gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 tabular-nums",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["HP ", hud.hp] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: ["Волна ", hud.wave]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Очки ", hud.score] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: WEAPON_ORDER.filter((id) => unlocked.includes(id)).map((id, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => api.current.setWeapon(id),
						className: `rounded-md border px-2.5 py-1 text-xs ${hud.weapon === id ? "border-accent bg-accent text-accent-fg" : "border-border bg-surface text-fg"}`,
						children: [
							i + 1,
							" ",
							WEAPONS[id].name
						]
					}, id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-lg border border-border bg-surface",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						width: VW,
						height: VH,
						className: "block h-auto w-full touch-none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: stickRef,
						className: "absolute bottom-4 left-4 size-24 rounded-full border border-border bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] md:hidden",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "absolute right-4 bottom-4 hidden size-16 rounded-full border border-border bg-accent text-accent-fg max-md:grid place-items-center text-xs font-medium",
						onPointerDown: (e) => {
							e.preventDefault();
							api.current.fire();
						},
						children: "Огонь"
					}),
					phase === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center bg-[color-mix(in_oklab,var(--color-bg)_78%,transparent)] px-6 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl text-fg",
								children: "Сражение"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-md text-sm leading-relaxed text-muted",
								children: "Двор школы №124. WASD — бег, мышь — прицел, клик — стрельба. Танки едут по двору, дроны летают над крышами. Оружие качается в профиле."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn-primary mt-5",
								onClick: () => api.current.start(),
								children: "В бой"
							})
						]
					}),
					phase === "over" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center bg-[color-mix(in_oklab,var(--color-bg)_78%,transparent)] px-6 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl text-fg",
								children: "Поражение"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm text-muted",
								children: [
									"Очки ",
									hud.score,
									" · волна ",
									hud.wave
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn-primary mt-5",
								onClick: () => api.current.start(),
								children: "Ещё раз"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-center text-xs text-muted",
				children: "WASD двигаться · мышь целиться · 1–5 оружие · пробел / клик стрелять"
			})
		]
	});
}
function load(src) {
	const i = new Image();
	i.crossOrigin = "anonymous";
	i.src = src;
	return i;
}
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl px-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display mb-6 text-2xl text-fg",
			children: "Сражение"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BattleGame, {})]
	});
}
//#endregion
export { Page as component };
