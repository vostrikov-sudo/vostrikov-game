export type WeaponId = "sword" | "pistol" | "cannon" | "rocket" | "drones";

export type WeaponDef = {
  id: WeaponId;
  name: string;
  blurb: string;
  cost: number;
  baseDamage: number;
  fireInterval: number;
  range: number;
  projectileSpeed: number;
  splash: number;
};

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  sword: {
    id: "sword",
    name: "Меч",
    blurb: "Ближний удар. Всегда с собой.",
    cost: 0,
    baseDamage: 34,
    fireInterval: 0.32,
    range: 78,
    projectileSpeed: 0,
    splash: 0,
  },
  pistol: {
    id: "pistol",
    name: "Пистолет",
    blurb: "Быстрые точные выстрелы.",
    cost: 70,
    baseDamage: 16,
    fireInterval: 0.14,
    range: 520,
    projectileSpeed: 640,
    splash: 0,
  },
  cannon: {
    id: "cannon",
    name: "Пушка",
    blurb: "Тяжёлые снаряды по танкам.",
    cost: 150,
    baseDamage: 46,
    fireInterval: 0.48,
    range: 640,
    projectileSpeed: 420,
    splash: 28,
  },
  rocket: {
    id: "rocket",
    name: "Ракеты",
    blurb: "Взрыв по площади.",
    cost: 240,
    baseDamage: 72,
    fireInterval: 0.85,
    range: 700,
    projectileSpeed: 360,
    splash: 90,
  },
  drones: {
    id: "drones",
    name: "Дроны",
    blurb: "Автономные дроны рядом с героем.",
    cost: 190,
    baseDamage: 12,
    fireInterval: 0.55,
    range: 420,
    projectileSpeed: 500,
    splash: 0,
  },
};

export const WEAPON_ORDER: WeaponId[] = ["sword", "pistol", "cannon", "rocket", "drones"];

export function weaponDamage(id: WeaponId, level: number) {
  return Math.round(WEAPONS[id].baseDamage * (1 + 0.22 * (level - 1)));
}

export function upgradeCost(level: number) {
  return 55 + level * 40;
}
