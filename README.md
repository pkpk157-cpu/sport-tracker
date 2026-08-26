# 🏆 The Verandas Pickleball Cup

*Two houses. One cup. Endless glory.*

A liquid-glass, app-style scorekeeper built for one tournament:
**Soni Smashers** (House of the Mighty Smash) vs **Sam Dinkers**
(Order of the Noble Dink), battling across the Roll of Contests.

## How it works

### 🏆 Overview tab
- Head-to-head scoreboard — **every contest won = 1 point** to the house.
- Live leader banner, progress bar of decided contests, and the champion
  crowned once all contests are decided (ties share the glory).
- List of every decided contest with players and score line.
- Reset button to clear all results.

### ⚔️ Contests tab
Pre-loaded with **Exhibit A — the 11 championship divisions** (Risers
Doubles & Singles, Women's Doubles, Mixed Doubles, 50+ Doubles & Singles,
Men's Doubles & Singles, Combined Age 80+ Doubles, Split Age 50+/− Doubles,
Gender Neutral Open Doubles) **plus Exhibit B — the Grand Team Rally**.

Per contest:
- Pick the fielded players from each house's roster (1 for singles, 2 for doubles).
- **Two recording modes**:
  - ✍️ **Final score** — type the end score of each game (1–3 games; tied
    games and level match scores are rejected).
  - 🎯 **Point by point** — tap-to-score live scorer with rally-to 11/15/21,
    rally point scoring, game-point and **GOLDEN POINT** badges (first to
    the target wins, even from 14–14), undo and reset. Finished games save
    into the score rows automatically.
- Record → the winning house banks **1 point**. Reopen & edit any time.
- The council can add extra contests mid-tournament.

### ⚙️ Settings tab
- **Appearance**: Light / Dark / System theme (System follows the device
  preference live); choice persists per device.
- **Backup & restore**: download the cup as a JSON file or copy it, and
  restore by pasting a backup — moves scores between devices.
- Danger zone: reset all results.

### 🛡️ Houses tab
The Roll Call of the Realm — both 14-player rosters with crests and mottos,
plus **live player records**: each player shows their W–L tally, and tapping
a player opens their battle record — every contest they played, with partner,
opponents, score line (from their perspective) and won/lost.

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
