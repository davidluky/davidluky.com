export {};

declare global {
  interface Window {
    __stats: {
      roomGames: number;
      roomAchievements: number;
    };
    __gaming: {
      totalGames: number;
      totalHours: number;
      gamesWithHours: number;
      mostPlayedCount: number;
      mostPlayedTotal: number;
      steamGames: number;
      epicGames: number;
    };
    __about: {
      timelinePt: string[];
      techCategoriesPt: string[];
      roomGames: number;
      roomAchievements: number;
    };
  }
}
