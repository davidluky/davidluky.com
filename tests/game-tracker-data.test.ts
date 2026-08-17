import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import tracker from "../src/data/gameTracker.json";

const QUEUE_STATUSES = ["Backlog", "Finish this year", "In progress"];
const PLAYED_STATUSES = ["Finished", "In progress"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("gameTracker.json integrity", () => {
  it("has a current UTF-8 payload without mojibake", () => {
    const raw = readFileSync("src/data/gameTracker.json", "utf8");
    expect(raw).not.toContain("Ã"); // "Ã" — the classic cp1252 double-encode tell
    expect(tracker.updated).toMatch(ISO_DATE);
    expect(tracker.generatedFrom).toContain("REVISADA");
  });

  it("summary counts match the section arrays", () => {
    expect(tracker.summary.activePlayOrderRows).toBe(tracker.playOrder.length);
    expect(tracker.summary.finishThisYear).toBe(tracker.finishThisYear.length);
    expect(tracker.summary.inProgress).toBe(tracker.inProgress.length);
    expect(tracker.summary.finishedThisYear).toBe(tracker.finishedThisYear.length);
    expect(tracker.summary.pokemonRows).toBe(tracker.pokemon.length);
    expect(tracker.summary.historyRecords).toBe(tracker.history.length);
    expect(tracker.summary.backlogRows).toBe(
      tracker.playOrder.filter((row) => row.status === "Backlog").length,
    );
    expect(tracker.summary.queue2026Targets).toBe(
      tracker.playOrder.filter((row) => row.status === "Finish this year").length,
    );
    expect(tracker.summary.queueInProgress).toBe(
      tracker.playOrder.filter((row) => row.status === "In progress").length,
    );
    expect(tracker.summary.previousFinished).toBe(
      tracker.history.filter((row) => row.status === "Finished" && row.year < 2026).length,
    );
  });

  it("playOrder is contiguous, statused, and sorted oldest-first", () => {
    tracker.playOrder.forEach((row, index) => {
      expect(row.rank).toBe(index + 1);
      expect(QUEUE_STATUSES).toContain(row.status);
      expect(row.releaseDate).toMatch(ISO_DATE);
    });
    for (let i = 1; i < tracker.playOrder.length; i += 1) {
      expect(tracker.playOrder[i].releaseDate >= tracker.playOrder[i - 1].releaseDate).toBe(true);
    }
    expect(tracker.playOrder[0].game).toBe(tracker.summary.oldestActiveGame);
    expect(tracker.playOrder[0].year).toBe(tracker.summary.oldestReleaseYear);
  });

  it("decadeCounts sums to the active play order", () => {
    const total = Object.values(tracker.decadeCounts).reduce((sum, n) => sum + n, 0);
    expect(total).toBe(tracker.playOrder.length);
  });

  it("finish-this-year targets are priorities 1..N with the right next target", () => {
    const priorities = tracker.finishThisYear.map((row) => row.priority);
    expect(priorities).toEqual(
      Array.from({ length: tracker.finishThisYear.length }, (_, i) => i + 1),
    );
    expect(tracker.summary.nextFinishTarget).toBe(tracker.finishThisYear[0].game);
  });

  it("in-progress rows all have start dates, sorted ascending", () => {
    tracker.inProgress.forEach((row) => expect(row.started).toMatch(ISO_DATE));
    for (let i = 1; i < tracker.inProgress.length; i += 1) {
      expect(tracker.inProgress[i].started >= tracker.inProgress[i - 1].started).toBe(true);
    }
  });

  it("history rows are valid and finished-in-2026 rows agree", () => {
    tracker.history.forEach((row) => {
      expect(PLAYED_STATUSES).toContain(row.status);
      expect(typeof row.year).toBe("number");
      if (row.status === "Finished") expect(row.finished).toMatch(ISO_DATE);
    });
    tracker.finishedThisYear.forEach((row) => {
      expect(row.status).toBe("Finished");
      expect(row.finished.startsWith("2026")).toBe(true);
    });
  });

  it("forecast fields are present and plausible", () => {
    expect(tracker.summary.paceFinishedPerMonth).toBeGreaterThan(0);
    expect(tracker.summary.scenarioPerMonth).toBeGreaterThan(0);
    expect(tracker.summary.projectedFinishCurrentPace).toMatch(ISO_DATE);
    expect(tracker.summary.projectedFinishOnePerMonth).toMatch(ISO_DATE);
    expect(tracker.summary.remainingToFinish).toBeGreaterThan(0);
    expect(tracker.summary.totalMapped).toBeGreaterThan(tracker.summary.remainingToFinish);
  });
});
