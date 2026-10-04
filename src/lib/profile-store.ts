import { create } from "zustand";
import { WEAPON_ORDER, type WeaponId } from "@/lib/weapons";

const SAVE_VERSION = 1;
const KEY = "vostrikov-profile-v1";

export type Profile = {
  version: number;
  name: string;
  coins: number;
  xp: number;
  extraHearts: number;
  unlocked: WeaponId[];
  levels: Record<WeaponId, number>;
  runnerBest: number;
  runnerDistance: number;
  battleBest: number;
  battleWave: number;
};

const defaults: Profile = {
  version: SAVE_VERSION,
  name: "Востриков",
  coins: 120,
  xp: 0,
  extraHearts: 0,
  unlocked: ["sword"],
  levels: { sword: 1, pistol: 1, cannon: 1, rocket: 1, drones: 1 },
  runnerBest: 0,
  runnerDistance: 0,
  battleBest: 0,
  battleWave: 0,
};

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults, levels: { ...defaults.levels }, unlocked: [...defaults.unlocked] };
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return {
      ...defaults,
      ...parsed,
      version: SAVE_VERSION,
      levels: { ...defaults.levels, ...parsed.levels },
      unlocked: parsed.unlocked?.length ? parsed.unlocked : ["sword"],
    };
  } catch {
    return { ...defaults, levels: { ...defaults.levels }, unlocked: [...defaults.unlocked] };
  }
}

function persist(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* private mode */
  }
}

type Store = Profile & {
  hydrated: boolean;
  hydrate: () => void;
  setName: (name: string) => void;
  addCoins: (n: number) => void;
  addXp: (n: number) => void;
  unlock: (id: WeaponId, cost: number) => boolean;
  upgrade: (id: WeaponId, cost: number) => boolean;
  buyHeart: (cost: number) => boolean;
  recordRunner: (score: number, distance: number) => void;
  recordBattle: (score: number, wave: number) => void;
  level: () => number;
};

export const useProfile = create<Store>((set, get) => ({
  ...defaults,
  hydrated: false,
  hydrate: () => {
    if (typeof window === "undefined") return;
    set({ ...load(), hydrated: true });
  },
  setName: (name) => {
    const n = name.slice(0, 24) || "Востриков";
    const next = { ...strip(get()), name: n };
    set(next);
    persist(next);
  },
  addCoins: (n) => {
    const coins = Math.max(0, get().coins + n);
    set({ coins });
    persist(strip(get()));
  },
  addXp: (n) => {
    const xp = get().xp + n;
    set({ xp });
    persist(strip(get()));
  },
  unlock: (id, cost) => {
    const s = get();
    if (s.unlocked.includes(id) || s.coins < cost) return false;
    const next = { ...strip(s), coins: s.coins - cost, unlocked: [...s.unlocked, id] };
    set(next);
    persist(next);
    return true;
  },
  upgrade: (id, cost) => {
    const s = get();
    if (!s.unlocked.includes(id) || s.coins < cost) return false;
    const levels = { ...s.levels, [id]: (s.levels[id] ?? 1) + 1 };
    const next = { ...strip(s), coins: s.coins - cost, levels };
    set(next);
    persist(next);
    return true;
  },
  buyHeart: (cost) => {
    const s = get();
    if (s.extraHearts >= 2 || s.coins < cost) return false;
    const next = { ...strip(s), coins: s.coins - cost, extraHearts: s.extraHearts + 1 };
    set(next);
    persist(next);
    return true;
  },
  recordRunner: (score, distance) => {
    const s = get();
    const next = {
      ...strip(s),
      runnerBest: Math.max(s.runnerBest, score),
      runnerDistance: Math.max(s.runnerDistance, distance),
    };
    set(next);
    persist(next);
  },
  recordBattle: (score, wave) => {
    const s = get();
    const next = {
      ...strip(s),
      battleBest: Math.max(s.battleBest, score),
      battleWave: Math.max(s.battleWave, wave),
    };
    set(next);
    persist(next);
  },
  level: () => 1 + Math.floor(get().xp / 180),
}));

function strip(s: Store): Profile {
  return {
    version: SAVE_VERSION,
    name: s.name,
    coins: s.coins,
    xp: s.xp,
    extraHearts: s.extraHearts,
    unlocked: s.unlocked,
    levels: s.levels,
    runnerBest: s.runnerBest,
    runnerDistance: s.runnerDistance,
    battleBest: s.battleBest,
    battleWave: s.battleWave,
  };
}

export function profileLevel(xp: number) {
  return 1 + Math.floor(xp / 180);
}

export { WEAPON_ORDER };
