//#region node_modules/.nitro/vite/services/ssr/assets/weapons-HFaUkYTd.js
var WEAPONS = {
	sword: {
		id: "sword",
		name: "Меч",
		blurb: "Ближний удар. Всегда с собой.",
		cost: 0,
		baseDamage: 34,
		fireInterval: .32,
		range: 78,
		projectileSpeed: 0,
		splash: 0
	},
	pistol: {
		id: "pistol",
		name: "Пистолет",
		blurb: "Быстрые точные выстрелы.",
		cost: 70,
		baseDamage: 16,
		fireInterval: .14,
		range: 520,
		projectileSpeed: 640,
		splash: 0
	},
	cannon: {
		id: "cannon",
		name: "Пушка",
		blurb: "Тяжёлые снаряды по танкам.",
		cost: 150,
		baseDamage: 46,
		fireInterval: .48,
		range: 640,
		projectileSpeed: 420,
		splash: 28
	},
	rocket: {
		id: "rocket",
		name: "Ракеты",
		blurb: "Взрыв по площади.",
		cost: 240,
		baseDamage: 72,
		fireInterval: .85,
		range: 700,
		projectileSpeed: 360,
		splash: 90
	},
	drones: {
		id: "drones",
		name: "Дроны",
		blurb: "Автономные дроны рядом с героем.",
		cost: 190,
		baseDamage: 12,
		fireInterval: .55,
		range: 420,
		projectileSpeed: 500,
		splash: 0
	}
};
var WEAPON_ORDER = [
	"sword",
	"pistol",
	"cannon",
	"rocket",
	"drones"
];
function weaponDamage(id, level) {
	return Math.round(WEAPONS[id].baseDamage * (1 + .22 * (level - 1)));
}
function upgradeCost(level) {
	return 55 + level * 40;
}
//#endregion
export { weaponDamage as i, WEAPON_ORDER as n, upgradeCost as r, WEAPONS as t };
