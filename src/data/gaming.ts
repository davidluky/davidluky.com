import { stats } from "./stats";

export interface GameEntry {
  name: string;
  platform: string;
  hours: number;
  lastPlayed: string | null;
}

export interface GamingData {
  source: "game-library" | "steam-api" | "fallback";
  totalGames: number;
  totalHours: number;
  ownedByPlatform: Record<string, number>;
  recentGames: GameEntry[];
  mostPlayed: GameEntry[];
  distribution: { over100h: number; h10to100: number; h1to10: number; under1h: number };
}

const GAME_LIBRARY_DB = "C:/Users/david/AppData/Roaming/game-library/library.db";
const STEAM_CACHE = ".cache/steam-games.json";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function fromGameLibrary(): GamingData | null {
  try {
    const Database = require("better-sqlite3");
    const db = new Database(GAME_LIBRARY_DB, { readonly: true });

    const totalGames = db.prepare(
      "SELECT COUNT(DISTINCT pg.game_id) as c FROM platform_games pg JOIN user_games ug ON ug.platform_game_id = pg.id AND ug.source = 'owned'"
    ).get().c;

    const totalMinutes = db.prepare("SELECT SUM(playtime_minutes) as t FROM game_stats").get().t || 0;

    const platforms = db.prepare(
      `SELECT pg.platform, COUNT(DISTINCT pg.game_id) as c
       FROM platform_games pg
       JOIN user_games ug ON ug.platform_game_id = pg.id AND ug.source = 'owned'
       GROUP BY pg.platform`
    ).all();
    const ownedByPlatform: Record<string, number> = {};
    for (const p of platforms) ownedByPlatform[p.platform] = p.c;

    const recentGames: GameEntry[] = db.prepare(
      `SELECT g.name, gs.playtime_minutes, gs.platform, gs.last_played_at
       FROM game_stats gs JOIN games g ON g.id = gs.game_id
       WHERE gs.last_played_at IS NOT NULL AND gs.playtime_minutes > 0
       ORDER BY gs.last_played_at DESC LIMIT 8`
    ).all().map((r: any) => ({
      name: r.name,
      platform: r.platform,
      hours: Math.round(r.playtime_minutes / 60),
      lastPlayed: r.last_played_at?.slice(0, 10) ?? null,
    }));

    const mostPlayed: GameEntry[] = db.prepare(
      `SELECT g.name, gs.playtime_minutes, gs.platform, gs.last_played_at
       FROM game_stats gs JOIN games g ON g.id = gs.game_id
       WHERE gs.playtime_minutes > 0
       ORDER BY gs.playtime_minutes DESC LIMIT 25`
    ).all().map((r: any) => ({
      name: r.name,
      platform: r.platform,
      hours: Math.round(r.playtime_minutes / 60),
      lastPlayed: r.last_played_at?.slice(0, 10) ?? null,
    }));

    const dist = db.prepare(
      `SELECT
        COUNT(CASE WHEN playtime_minutes >= 6000 THEN 1 END) as a,
        COUNT(CASE WHEN playtime_minutes >= 600 AND playtime_minutes < 6000 THEN 1 END) as b,
        COUNT(CASE WHEN playtime_minutes >= 60 AND playtime_minutes < 600 THEN 1 END) as c,
        COUNT(CASE WHEN playtime_minutes > 0 AND playtime_minutes < 60 THEN 1 END) as d
       FROM game_stats`
    ).get();

    db.close();

    return {
      source: "game-library",
      totalGames,
      totalHours: Math.round(totalMinutes / 60),
      ownedByPlatform,
      recentGames,
      mostPlayed,
      distribution: { over100h: dist.a, h10to100: dist.b, h1to10: dist.c, under1h: dist.d },
    };
  } catch {
    return null;
  }
}

async function fromSteamAPI(): Promise<GamingData | null> {
  const apiKey = import.meta.env.STEAM_API_KEY;
  const steamId = import.meta.env.STEAM_ID;
  if (!apiKey || !steamId) return null;

  try {
    const fs = await import("node:fs");
    const path = await import("node:path");

    // Check cache
    const cachePath = path.resolve(STEAM_CACHE);
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;
    } catch { /* no cache or expired */ }

    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json();
    const games = json.response?.games ?? [];

    const sorted = [...games].sort((a: any, b: any) => b.playtime_forever - a.playtime_forever);
    const totalMinutes = games.reduce((s: number, g: any) => s + g.playtime_forever, 0);

    const toEntry = (g: any): GameEntry => ({
      name: g.name,
      platform: "steam",
      hours: Math.round(g.playtime_forever / 60),
      lastPlayed: null,
    });

    const recentRaw = [...games]
      .filter((g: any) => g.playtime_2weeks)
      .sort((a: any, b: any) => b.playtime_2weeks - a.playtime_2weeks);

    const data: GamingData = {
      source: "steam-api",
      totalGames: games.length,
      totalHours: Math.round(totalMinutes / 60),
      ownedByPlatform: { steam: games.length },
      recentGames: recentRaw.slice(0, 8).map(toEntry),
      mostPlayed: sorted.slice(0, 25).map(toEntry),
      distribution: {
        over100h: games.filter((g: any) => g.playtime_forever >= 6000).length,
        h10to100: games.filter((g: any) => g.playtime_forever >= 600 && g.playtime_forever < 6000).length,
        h1to10: games.filter((g: any) => g.playtime_forever >= 60 && g.playtime_forever < 600).length,
        under1h: games.filter((g: any) => g.playtime_forever > 0 && g.playtime_forever < 60).length,
      },
    };

    // Write cache
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify({ timestamp: Date.now(), data }));

    return data;
  } catch {
    return null;
  }
}

function fallbackData(): GamingData {
  return {
    source: "fallback",
    totalGames: 1647,
    totalHours: 12250,
    ownedByPlatform: { steam: 1366, epic: 281 },
    recentGames: [
      { name: "Counter-Strike 2", platform: "steam", hours: 621, lastPlayed: "2026-03-19" },
      { name: "GeoGuessr Steam Edition", platform: "steam", hours: 3, lastPlayed: "2026-03-15" },
      { name: "Torchlight", platform: "steam", hours: 15, lastPlayed: "2026-03-15" },
      { name: "Shotgun King: The Final Checkmate", platform: "steam", hours: 9, lastPlayed: "2026-03-13" },
      { name: "Dota 2", platform: "steam", hours: 6326, lastPlayed: "2026-03-09" },
      { name: "Terraria", platform: "steam", hours: 1238, lastPlayed: "2026-03-03" },
      { name: "Battlefield™ 6", platform: "steam", hours: 21, lastPlayed: "2026-01-19" },
      { name: "3DMark", platform: "steam", hours: 17, lastPlayed: "2026-01-18" },
    ],
    mostPlayed: [
      { name: "Dota 2", platform: "steam", hours: 6326, lastPlayed: "2026-03-09" },
      { name: "Terraria", platform: "steam", hours: 1238, lastPlayed: "2026-03-03" },
      { name: "Counter-Strike 2", platform: "steam", hours: 621, lastPlayed: "2026-03-19" },
      { name: "Professional Farmer 2014", platform: "steam", hours: 397, lastPlayed: null },
      { name: "Age of Empires II: Definitive Edition", platform: "steam", hours: 337, lastPlayed: null },
      { name: "Minion Masters", platform: "steam", hours: 325, lastPlayed: null },
      { name: "Call of Duty®: Modern Warfare® 3 (2011) - Multiplayer", platform: "steam", hours: 106, lastPlayed: null },
      { name: "Call of Duty: Modern Warfare 2 (2009) - Multiplayer", platform: "steam", hours: 100, lastPlayed: null },
      { name: "Core Keeper", platform: "steam", hours: 95, lastPlayed: null },
      { name: "Alone in the Dark (2008)", platform: "steam", hours: 93, lastPlayed: null },
      { name: "Disgaea PC", platform: "steam", hours: 90, lastPlayed: null },
      { name: "Street Fighter V", platform: "steam", hours: 70, lastPlayed: null },
    ],
    distribution: { over100h: 7, h10to100: 78, h1to10: 317, under1h: 71 },
  };
}

export async function loadGamingData(): Promise<GamingData> {
  // Priority: Game Library DB > Steam API > hardcoded fallback
  const gl = fromGameLibrary();
  if (gl) return gl;

  const steam = await fromSteamAPI();
  if (steam) return steam;

  return fallbackData();
}
