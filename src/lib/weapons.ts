export type WeaponId =
  "sword" | "pistol" | "cannon" | "rocket" | "drones" | "smg" | "shotgun" | "sniper" | "plasma";

export type WeaponDef = {
  id: WeaponId;
  name: string;
  blurb: string;
  cost: number;
  magazine: number;
  reload: number;
  pellets: number;
  spread: number;
  wave: number;
  baseDamage: number;
  fireInterval: number;
  range: number;
  projectileSpeed: number;
  splash: number;
};

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  sword: {
    id: "sword",
    magazine: 0,
    reload: 0,
    pellets: 1,
    spread: 0,
    wave: 1,
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
    magazine: 14,
    reload: 1,
    pellets: 1,
    spread: 0.015,
    wave: 1,
    name: "Пистолет",
    blurb: "Быстрые точные выстрелы.",
    cost: 0,
    baseDamage: 16,
    fireInterval: 0.14,
    range: 520,
    projectileSpeed: 640,
    splash: 0,
  },
  cannon: {
    id: "cannon",
    magazine: 5,
    reload: 1.8,
    pellets: 1,
    spread: 0,
    wave: 2,
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
    magazine: 3,
    reload: 2.2,
    pellets: 1,
    spread: 0,
    wave: 3,
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
    magazine: 3,
    reload: 3,
    pellets: 1,
    spread: 0,
    wave: 3,
    name: "Дроны",
    blurb: "Автономные дроны рядом с героем.",
    cost: 190,
    baseDamage: 12,
    fireInterval: 0.55,
    range: 420,
    projectileSpeed: 500,
    splash: 0,
  },
  smg: {
    id: "smg",
    name: "Автомат",
    blurb: "Длинная очередь, небольшой разброс.",
    cost: 0,
    baseDamage: 11,
    fireInterval: 0.08,
    range: 580,
    projectileSpeed: 800,
    splash: 0,
    magazine: 32,
    reload: 1.5,
    pellets: 1,
    spread: 0.09,
    wave: 1,
  },
  shotgun: {
    id: "shotgun",
    name: "Дробовик",
    blurb: "Семь дробин для ближнего боя.",
    cost: 0,
    baseDamage: 12,
    fireInterval: 0.65,
    range: 300,
    projectileSpeed: 720,
    splash: 0,
    magazine: 6,
    reload: 1.8,
    pellets: 7,
    spread: 0.32,
    wave: 1,
  },
  sniper: {
    id: "sniper",
    name: "Снайперская",
    blurb: "Точный выстрел с большим уроном.",
    cost: 280,
    baseDamage: 120,
    fireInterval: 1.1,
    range: 1200,
    projectileSpeed: 1800,
    splash: 0,
    magazine: 4,
    reload: 2,
    pellets: 1,
    spread: 0,
    wave: 4,
  },
  plasma: {
    id: "plasma",
    name: "Плазма",
    blurb: "Скоростные заряды со взрывом.",
    cost: 350,
    baseDamage: 22,
    fireInterval: 0.18,
    range: 620,
    projectileSpeed: 560,
    splash: 55,
    magazine: 20,
    reload: 2,
    pellets: 1,
    spread: 0.03,
    wave: 5,
  },
};

export const STARTER_WEAPONS: WeaponId[] = ["sword", "pistol", "smg", "shotgun"];

export const WEAPON_ORDER: WeaponId[] = [
  "sword",
  "pistol",
  "smg",
  "shotgun",
  "cannon",
  "rocket",
  "drones",
  "sniper",
  "plasma",
];

export function weaponDamage(id: WeaponId, level: number) {
  return Math.round(WEAPONS[id].baseDamage * (1 + 0.22 * (level - 1)));
}

export function upgradeCost(level: number) {
  return 55 + level * 40;
}
