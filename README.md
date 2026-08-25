# 🎾 RallyGlass — Racquet Sports Scoring

A liquid-glass web app for scoring racquet sports. Record matches **point by
point** during play, or log **final scores for tournaments** and watch the
standings update automatically.

Supports **Tennis, Padel, Pickleball, Badminton, and Squash** — each with its
own real scoring rules.

## Features

### 🟢 Live Scoring tab
- Pick a sport and name the two players/teams.
- Tap **+ Point** for each side — the app applies the correct scoring engine:
  - **Tennis / Padel** — 15 / 30 / 40, deuce & advantage, games, sets, and a
    tiebreak at 6-6. Choose best of 3 or 5 sets.
  - **Pickleball** — rally to 11, win by 2, best of 3 games.
  - **Badminton** — rally to 21 (cap at 30), best of 3 games.
  - **Squash** — point-a-rally to 11, win by 2, best of 5 games.
- Live scoreboard shows sets/games won, the current game score, and completed
  sets/games.
- **Undo** any point; the match is recomputed from the point log.
- Completed matches can be saved to a **recent results** list.

### 🏆 Tournaments tab
- Create a tournament with a **name** and sport.
- **Add team names** and record match results (final end scores).
- Auto-computed **standings**: played, won, lost, points for/against, point
  difference, and points (2 per win).

## Running it

It's a static site with no build step or dependencies. Either:

```bash
# open directly
open index.html          # macOS  (or just double-click the file)

# …or serve it locally
python3 -m http.server 8000
# then visit http://localhost:8000
```

All data is stored locally in your browser (`localStorage`) — it works offline
and nothing leaves your device.

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell and tab layout |
| `styles.css` | Liquid-glass theme (glassmorphism, animated backdrop) |
| `app.js` | Scoring engines, live scoring, and tournament logic |
