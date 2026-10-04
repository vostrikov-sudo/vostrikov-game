import { n as WEAPON_ORDER, r as upgradeCost, t as WEAPONS } from "./weapons-HFaUkYTd.mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Heart } from "../_libs/lucide-react.mjs";
import { n as profileLevel, r as useProfile } from "./router--JjdGKzB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-CYshm10P.js
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const p = useProfile();
	const lvl = profileLevel(p.xp);
	const xpInto = p.xp % 180;
	const need = 180;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl px-4 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl text-fg",
			children: "Профиль героя"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-8 lg:grid-cols-[280px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "rounded-lg border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/photos/character.png",
						alt: "",
						className: "mx-auto h-56 w-auto"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-xs text-muted",
						children: "Имя"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: p.name,
						onChange: (e) => p.setName(e.target.value),
						className: "mt-1 w-full rounded-md border border-border bg-subtle px-3 py-2 text-fg"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-5 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Уровень",
								v: String(lvl)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Опыт",
								v: `${xpInto} / ${need}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Монеты",
								v: String(p.coins)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Сердца в раннере",
								v: String(3 + p.extraHearts)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Рекорд раннера",
								v: String(p.runnerBest)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Рекорд сражения",
								v: String(p.battleBest)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 h-1.5 overflow-hidden rounded-full bg-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-accent",
							style: { width: `${xpInto / need * 100}%` }
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-border bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg text-fg",
							children: "Жизни"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Стартовые сердца в раннере. Максимум пять."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex items-center gap-2",
							children: Array.from({ length: 3 + p.extraHearts }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-6 fill-danger text-danger" }, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-primary mt-4",
							disabled: p.extraHearts >= 2 || p.coins < 90,
							onClick: () => p.buyHeart(90),
							children: "Докупить сердце · 90"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg text-fg",
						children: "Оружие"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Покупай стволы за монеты, качай урон и скорострельность."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: WEAPON_ORDER.map((id) => {
							const w = WEAPONS[id];
							const owned = p.unlocked.includes(id);
							const lv = p.levels[id] ?? 1;
							const up = upgradeCost(lv);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-lg border border-border bg-surface p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-medium text-fg",
											children: w.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted",
											children: owned ? `ур. ${lv}` : `${w.cost} мон.`
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: w.blurb
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-muted",
										children: ["Урон ", Math.round(w.baseDamage * (1 + .22 * (lv - 1)))]
									}),
									!owned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "btn-ghost mt-3 w-full",
										disabled: p.coins < w.cost,
										onClick: () => p.unlock(id, w.cost),
										children: "Купить"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "btn-ghost mt-3 w-full",
										disabled: p.coins < up || lv >= 8,
										onClick: () => p.upgrade(id, up),
										children: ["Улучшить · ", up]
									})
								]
							}, id);
						})
					})
				] })]
			})]
		})]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "tabular-nums text-fg",
			children: v
		})]
	});
}
//#endregion
export { ProfilePage as component };
