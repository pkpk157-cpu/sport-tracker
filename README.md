# 🏆 RallyGlass — Tournament Scores

A liquid-glass, app-style scoreboard for **one racquet-sports tournament**.
Create categories, add team names, record end scores — the app keeps
standings per category and crowns the tournament champion.

Sports supported per category: **Tennis, Padel, Pickleball, Badminton, Squash**.

## How it works

### 🏆 Overview tab
- Name (and rename) your tournament.
- At-a-glance stats: categories, finished, teams, matches.
- **Leaderboard of category wins** — whoever wins the most categories wins
  the tournament. When every category is finished, the champion is crowned
  automatically (ties share the title).
- Danger zone: wipe everything and start a new tournament.

### 🗂️ Categories tab
- Add categories (e.g. Men's Singles, Mixed Doubles), each with a sport.
- Inside a category: add/remove **team names**, record match end scores,
  and watch the **standings** (played, won, lost, points for/against,
  difference, 2 points per win; ranked by wins → point difference).
- **Finish** a category to lock in its winner (reopen any time).

### 📜 Results tab
- Every recorded match across all categories, newest first.

## Running it

A **single self-contained `index.html`** — no build step, no dependencies:

```bash
open index.html               # or double-click it
# …or serve it locally
python3 -m http.server 8000   # http://localhost:8000
```

All data lives in your browser (`localStorage`): works offline, survives
reloads, nothing leaves your device.

## Hosting on GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch.**
3. Pick the branch and the `/ (root)` folder, then **Save**.
4. Live at `https://<user>.github.io/<repo>/`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The entire app — HTML, liquid-glass CSS and tournament JS |
