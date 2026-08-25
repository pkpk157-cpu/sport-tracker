# 🏆 The Verandas Pickleball Cup

*Two houses. One cup. Endless glory.*

A liquid-glass, app-style scorekeeper built for one tournament:
**Soni Smashers** (House of the Mighty Smash) vs **Sam Dinkers**
(Order of the Noble Dink), battling across the Roll of Contests.

## How it works

### 🏆 Overview tab
- Head-to-head scoreboard: total **points** and contests won per house,
  live leader banner, and a progress bar of decided contests.
- The champion is crowned once all contests are decided (ties share the glory).
- List of every decided contest with players, score line and points awarded.
- Reset button to clear all results.

### ⚔️ Contests tab
Pre-loaded with **Exhibit A — the 11 championship divisions** (Risers
Doubles & Singles, Women's Doubles, Mixed Doubles, 50+ Doubles & Singles,
Men's Doubles & Singles, Combined Age 80+ Doubles, Split Age 50+/− Doubles,
Gender Neutral Open Doubles) **plus Exhibit B — the Grand Team Rally**.

Per contest:
- Pick the fielded players from each house's roster (1 for singles, 2 for doubles).
- Enter game scores (1–3 games, rally scoring, races to 15 or 21, golden
  point settles ties — the app rejects tied games and level match scores).
- **Points at stake** are editable (10 by decree; the Team Rally starts at
  TBD until the council reveals its points — rules may change 😎).
- Record → the winning house banks the points. Reopen & edit any time.
- The council can add extra contests mid-tournament.

### 🛡️ Houses tab
The Roll Call of the Realm — both 14-player rosters with crests and mottos.

## Running it

A **single self-contained `index.html`** — no build step, no dependencies:

```bash
open index.html               # or double-click it
# …or serve it locally
python3 -m http.server 8000   # http://localhost:8000
```

All data lives in the browser (`localStorage`): works offline, survives
reloads, nothing leaves the device.

## Hosting on GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch.**
3. Pick the branch and the `/ (root)` folder, then **Save**.
4. Live at `https://<user>.github.io/<repo>/`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The entire app — HTML, liquid-glass CSS and cup-scoring JS |
