#!/usr/bin/env python3
"""Regenerate src/data/gameTracker.json from David's "Video Jogos" workbook.

Usage:
    python scripts/generate-game-tracker.py "C:\\Users\\DavidLuky\\Downloads\\Video Jogos 2026 - Organized - REVISADA.xlsx"

Dev-machine tool: the JSON it writes is committed; nothing at build/deploy
time runs this. Needs openpyxl. Reads cached formula values, so the workbook
must have been saved by Excel (not merely edited by a script).
"""
import datetime as dt
import json
import sys
import unicodedata
from collections import Counter
from pathlib import Path

import openpyxl

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = REPO_ROOT / "src" / "data" / "gameTracker.json"
HEADER_ROW = 4

QUEUE_STATUS = {
    "Na fila": "Backlog",
    "Meta 2026": "Finish this year",
    "Jogando agora": "In progress",
    "JA TERMINADO": None,  # finished games stay only in history
}
PLAYED_STATUS = {"Terminado": "Finished", "Em andamento": "In progress"}


def clean(value):
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def iso(value):
    if isinstance(value, dt.datetime):
        value = value.date()
    if isinstance(value, dt.date) and value.year >= 1990:
        return value.isoformat()
    return None  # times, strings, blanks, sentinel 1899 dates


def as_int(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return int(value)
    return None


def norm_name(value):
    text = unicodedata.normalize("NFD", str(value)).casefold()
    return "".join(ch for ch in text if not unicodedata.combining(ch)).strip()


def data_rows(ws, expected_first_header):
    header = [clean(c) for c in next(ws.iter_rows(min_row=HEADER_ROW, max_row=HEADER_ROW, values_only=True))]
    if header[0] != expected_first_header:
        raise SystemExit(f"{ws.title}: expected header starting with {expected_first_header!r}, got {header!r}")
    return [row for row in ws.iter_rows(min_row=HEADER_ROW + 1, values_only=True) if clean(row[0]) is not None]


def map_status(raw, table, sheet):
    status = clean(raw)
    if status not in table:
        raise SystemExit(f"{sheet}: unknown status {status!r}")
    return table[status]


def join_notes(*parts):
    text = " · ".join(p for p in (clean(part) for part in parts) if p)
    return text or None


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    src = Path(sys.argv[1])
    wb = openpyxl.load_workbook(src, data_only=True)

    # --- Quero jogar -> playOrder ---
    play_order = []
    for row in data_rows(wb["Quero jogar"], "Jogo"):
        status = map_status(row[7], QUEUE_STATUS, "Quero jogar")
        if status is None:
            continue
        play_order.append({
            "rank": len(play_order) + 1,
            "game": clean(row[0]),
            "notes": join_notes(row[1], row[10]),
            "releaseDate": iso(row[2]),
            "year": as_int(row[3]) or (int(iso(row[2])[:4]) if iso(row[2]) else None),
            "decade": clean(row[4]),
            "whereToPlay": clean(row[5]),
            "trilha": clean(row[6]),
            "status": status,
            "queueRank": as_int(row[8]),
            "dateSource": clean(row[11]),
            "pokeNumber": as_int(row[12]),
        })

    # --- Terminar este ano -> finishThisYear (Pendente only) ---
    finish = []
    for row in data_rows(wb["Terminar este ano"], "Jogo"):
        if clean(row[5]) != "Pendente":
            continue
        finish.append({
            "priority": as_int(row[6]),
            "game": clean(row[0]),
            "notes": join_notes(row[1], row[7]),
            "releaseDate": iso(row[2]),
            "whereToPlay": clean(row[3]),
            "started": iso(row[4]),
        })
    if sorted(r["priority"] for r in finish) != list(range(1, len(finish) + 1)):
        raise SystemExit(f"Terminar este ano: priorities not 1..N: {[r['priority'] for r in finish]}")
    finish.sort(key=lambda r: r["priority"])

    # --- Jogados -> history / inProgress / finishedThisYear ---
    queue_by_name = {norm_name(r["game"]): r for r in play_order}
    history, in_progress, finished_2026 = [], [], []
    for row in data_rows(wb["Jogados"], "Jogo"):
        status = map_status(row[3], PLAYED_STATUS, "Jogados")
        started, finished = iso(row[1]), iso(row[2])
        year = as_int(row[5]) or (int(started[:4]) if started else None)
        record = {
            "year": year,
            "game": clean(row[0]),
            "started": started,
            "finished": finished,
            "status": status,
            "days": as_int(row[4]),
            "source": clean(row[6]),
            "notes": clean(row[7]),
        }
        history.append(record)
        if status == "In progress":
            queue_row = queue_by_name.get(norm_name(record["game"]))
            in_progress.append({
                "game": record["game"],
                "started": started,
                "releaseDate": queue_row["releaseDate"] if queue_row else None,
                "whereToPlay": queue_row["whereToPlay"] if queue_row else None,
                "notes": record["notes"],
                "source": record["source"],
            })
        elif year == 2026:
            finished_2026.append(record)
    in_progress.sort(key=lambda r: r["started"] or "9999")
    finished_2026.sort(key=lambda r: r["finished"] or "9999")

    # --- Pokemon sheet ---
    # Trailing rows keep their formula-driven number in col A but have no game,
    # so filter on the game name, not on the rank.
    pokemon = []
    for row in wb["Pokemon"].iter_rows(min_row=HEADER_ROW + 1, values_only=True):
        rank = as_int(row[0])
        if rank is None or clean(row[1]) is None:
            continue
        status = map_status(row[5], {**QUEUE_STATUS, "JA TERMINADO": "Finished"}, "Pokemon")
        pokemon.append({
            "rank": rank,
            "game": clean(row[1]),
            "platform": clean(row[2]),
            "releaseDate": iso(row[3]),
            "whereToPlay": clean(row[4]),
            "status": status,
        })

    # --- Painel -> forecast numbers (match by exact stripped label in col A) ---
    painel = {}
    termina_dates = []
    for row in wb["Painel"].iter_rows(values_only=True):
        label, value = clean(row[0]), row[1]
        if label is None:
            continue
        if label == "termina por volta de":
            termina_dates.append(iso(value))
        else:
            painel[label] = value
    try:
        pace = round(float(painel["Ritmo: terminados por mes (media 2022-2025)"]), 2)
        remaining = as_int(painel["Faltam terminar (metas deste ano + fila)"])
        total_mapped = as_int(painel["Total do acervo mapeado"])
        scenario = as_int(painel["E se voce jogar este tanto por mes:  (pode mudar)"])
    except KeyError as missing:
        raise SystemExit(f"Painel: label not found: {missing}. Labels seen: {sorted(painel)}")
    if len(termina_dates) != 2 or None in termina_dates:
        raise SystemExit(f"Painel: expected 2 'termina por volta de' dates, got {termina_dates}")

    decade_counts = dict(sorted(Counter(r["decade"] for r in play_order).items()))
    updated = dt.date.fromtimestamp(src.stat().st_mtime).isoformat()

    data = {
        "updated": updated,
        "generatedFrom": f"{src.name} ({updated})",
        "summary": {
            "activePlayOrderRows": len(play_order),
            "backlogRows": sum(1 for r in play_order if r["status"] == "Backlog"),
            "queue2026Targets": sum(1 for r in play_order if r["status"] == "Finish this year"),
            "queueInProgress": sum(1 for r in play_order if r["status"] == "In progress"),
            "finishThisYear": len(finish),
            "inProgress": len(in_progress),
            "finishedThisYear": len(finished_2026),
            "previousFinished": sum(1 for r in history if r["status"] == "Finished" and r["year"] < 2026),
            "pokemonRows": len(pokemon),
            "historyRecords": len(history),
            "oldestActiveGame": play_order[0]["game"],
            "oldestReleaseYear": play_order[0]["year"],
            "nextFinishTarget": finish[0]["game"],
            "totalMapped": total_mapped,
            "remainingToFinish": remaining,
            "paceFinishedPerMonth": pace,
            "scenarioPerMonth": scenario,
            "projectedFinishCurrentPace": termina_dates[0],
            "projectedFinishOnePerMonth": termina_dates[1],
        },
        "playOrder": play_order,
        "finishThisYear": finish,
        "inProgress": in_progress,
        "finishedThisYear": finished_2026,
        "pokemon": pokemon,
        "history": history,
        "decadeCounts": decade_counts,
    }

    with open(OUT_PATH, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(json.dumps(data["summary"], ensure_ascii=False, indent=2))
    print(f"wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
