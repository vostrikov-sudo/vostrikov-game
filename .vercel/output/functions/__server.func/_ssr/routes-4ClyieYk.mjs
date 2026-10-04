import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-4ClyieYk.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative min-h-[78vh] overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/photos/hero.jpg",
					alt: "Главный герой у школы",
					className: "absolute inset-0 size-full object-cover object-top"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-bg via-[color-mix(in_oklab,var(--color-bg)_45%,transparent)] to-[color-mix(in_oklab,var(--color-bg)_25%,transparent)]" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-end px-4 pb-16 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.25em] text-accent",
							children: "ШКОЛА №124 · ЕКАТЕРИНБУРГ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display mt-3 text-4xl tracking-tight text-fg sm:text-6xl",
							children: "VOSTRIKOV GAME"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-lg text-muted",
							children: "Главный герой. Две игры. Один двор."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap justify-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/runner",
								className: "btn-primary",
								children: "Раннер"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/battle",
								className: "btn-ghost",
								children: "Сражение"
							})]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative min-h-[70vh] overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/photos/armwrestle.jpg",
					alt: "Рукопожатие",
					className: "absolute inset-0 size-full object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[color-mix(in_oklab,var(--color-bg)_62%,transparent)]" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-lg border border-border bg-[color-mix(in_oklab,var(--color-bg)_80%,transparent)] p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl text-fg",
							children: "Раннер"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-4 space-y-2 text-sm leading-relaxed text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Прыжок: пробел, стрелка вверх или тап." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Сердца сверху — жизни. Их можно докупить в профиле." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Ящики, шипы, ямы, танки и дроны — прыгай вовремя." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Зелёный терминал останавливает забег и открывает задание: тест, провода или удержание." })
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-lg border border-border bg-[color-mix(in_oklab,var(--color-bg)_80%,transparent)] p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl text-fg",
							children: "Сражение"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-4 space-y-2 text-sm leading-relaxed text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Карта — школьный двор с газоном, дорожками и корпусами." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "WASD — ходьба, мышь — прицел, клик — огонь." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Враги: солдаты, танки, дроны. Прячься за здания." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Меч, пистолет, пушка, ракеты, дроны — покупка и апгрейд в профиле." })
							]
						})]
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/runner",
				className: "group overflow-hidden rounded-lg border border-border bg-surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-48 items-center justify-center bg-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/photos/character.png",
						alt: "",
						className: "h-44 w-auto"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg text-fg",
						children: "Раннер"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Марио-забег по школьному двору с заданиями."
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/battle",
				className: "overflow-hidden rounded-lg border border-border bg-surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-48 items-center justify-center bg-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/photos/character.png",
						alt: "",
						className: "h-44 w-auto"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg text-fg",
						children: "Сражение"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Танки и дроны на настоящей карте двора."
					})]
				})]
			})]
		})
	] });
}
//#endregion
export { Home as component };
