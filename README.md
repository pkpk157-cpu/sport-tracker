# 🎾 RallyGlass — Racquet Sports Scoring

A liquid-glass, app-style scorer for racquet sports. Record matches **point by
point** during play, or run **tournaments with categories** and let the app
crown the champion.

Supports **Tennis, Padel, Pickleball, Badminton, and Squash** — singles or
doubles, traditional or fully custom scoring.

## Features

### 🎾 Live tab — point-by-point scoring
- **Singles or doubles** — name every player; doubles teams show as "A & B".
- **Traditional scoring** per sport:
  - *Tennis / Padel* — 15/30/40, deuce (advantage **or golden point**), games,
    sets, tiebreak at 6-6, best of 3 or 5 sets, real serve rotation
    (alternating games, tiebreak pattern).
  - *Pickleball* — to 11, win by 2, **point on serve only (side-out)**, best of 3.
  - *Badminton* — rally to 21, cap 30, best of 3.
  - *Squash* — rally to 11, win by 2, best of 5.
- **Alternate scoring** — build your own format for any sport:
  - play up to any score,
  - single game / best of 3 / best of 5,
  - **point on any serve (rally)** or **point on serve only (side-out)**,
  - deuce as **advantage (win by 2)** or **golden point (sudden death)**.
- Serve tracking with a live **SERVING** indicator, pick who serves first.
- **Match point badge**, undo any point, save finished matches to History.

### 🏆 Tournaments tab — categories & champions
- Create a tournament, then add **categories** (e.g. Men's Singles, Mixed
  Doubles) — each with its own sport, **team names**, results and standings.
- Record end scores per category; standings rank by wins → point difference.
- **Finish** a category to lock its winner. The tournament **leaderboard
  counts category wins — whoever wins the most categories wins the
  tournament** (crowned automatically when every category is finished).

### 📜 History tab
- Every saved match with score line, format and rules used.

## Running it

A **single self-contained `index.html`** — no build step, no dependencies:

```bash
open index.html               # or double-click it
# …or serve it locally
python3 -m http.server 8000   # http://localhost:8000
```

All data lives in your browser (`localStorage`): works offline, survives
reloads (including a live match in progress), nothing leaves your device.

## Hosting on GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch.**
3. Pick the branch and the `/ (root)` folder, then **Save**.
4. Live at `https://<user>.github.io/<repo>/`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The entire app — HTML, liquid-glass CSS and all scoring/tournament JS |
