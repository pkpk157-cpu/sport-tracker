# 🏆 The Verandas Pickleball Cup

*Two houses. One cup. Endless glory.*

An installable web-app scorekeeper with a clean championship-app look
(flat white cards, one green accent, dark mode to match) built for one
tournament:
**Soni Smashers** (House of the Mighty Smash) vs **Sam Dinkers**
(Order of the Noble Dink), battling across the Roll of Contests.

## How it works

### 🏆 Overview tab
- Head-to-head scoreboard — **every contest won = 1 point** to the house.
- Live leader banner, progress bar, and a **momentum chart** of points as
  each contest was decided.
- **Up next** card with each pending contest's court and time — tap to score.
- **🔗 Share** — a link anyone can open to see a **read-only snapshot**
  of the scoreboard; **📱 QR** — the same snapshot as a scannable QR code
  for courtside spectators; **📸 Image** — the scoreboard as a PNG.
- **Cup stats** card — closest game, biggest win, golden-point finishes,
  rally points per house — plus an **MVP race podium** (contest wins →
  point difference).
- Champion crowned when all contests are decided — with confetti. 🎉

### ⚔️ Contests tab
Pre-loaded with Exhibit A — the 11 championship divisions — plus
Exhibit B, the Grand Team Rally. Recording a contest is a **two-step flow**:

**Step 1 — Players & rules**: court & time scheduling, fielded players
picked from the rosters (with **rule-of-2 warnings** — dropdowns flag
"⚠ 2 played" and picking them anyway raises a NO CHITCHING toast), and
**every game rule** — rally-to 11/15/21, scoring (every rally vs on
serve only) and first serve — plus optional note and photo. Then choose
how to record the score.

**Step 2 — The scoring page** is just the court and the buttons: a
**true-proportion (20×44) court** drawn like an aerial photo — green
apron, blue court, white lines, kitchen bands, black net — with
**player figurines** standing in their actual service courts, moving by
the real rules (pairs swap sides when they score on serve, singles
stand right/left by score parity, the server's figurine glows yellow
with the ball). **Two large house-colored buttons** below the court
record which side won each rally.
- **Two recording modes**:
  - ✍️ **Final score** — type end scores (1–3 games; ties rejected).
  - 🎯 **Point by point** — tap-to-score with rally-to 11/15/21, a
    **📺 courtside scoreboard mode** (fullscreen giant-numbers display,
    tap either half to score — prop the phone up at the net), a
    **serving rule** per game — *every rally* (decree default) or
    *point on serve only* with true pickleball serve tracking (doubles
    server #1/#2, the opening 0–0–2 rule, side-outs, live serving
    indicator and the three-number score call), first-serve picker,
    game-point & **GOLDEN POINT** badges, a **rally timeline** with
    longest-run stat, undo/reset, optional **score announcements** and
    per-house **sound effects**, and **auto-saved finished games**.
    The screen **stays awake** while scoring (toggleable).
- A **note** and a **photo** can be attached to any contest.
- Record banks 1 point — an **Undo toast** gives 6 seconds to take it back;
  reopen & edit any time. Extra contests can be added mid-tournament.

### 🛡️ Houses tab
The Roll Call of the Realm with **live player records** (W–L per player,
⚠️ flag past the 2-contest limit). Tap a player for their **battle record**:
every contest with partner, opponents, perspective score lines, won/lost,
and total rally points won/conceded. Rosters are **editable in-app**
(add or remove players).

### ⚙️ Settings tab
- **Appearance**: ☀️ Light / 🌙 Dark / 📱 System (follows the device live).
- **Scoring**: keep screen awake · auto-save finished games ·
  announce scores · sound effects.
- **Backup & restore**: download/copy the cup as JSON, paste to restore.
- Danger zone: reset all results.

## Install & offline (PWA)
When hosted (e.g. GitHub Pages), the app is installable to the home screen
(`manifest.webmanifest` + `icon.svg`) and works fully **offline** via a
service worker (`sw.js`). Scores always live in the device's browser.

## Running it

```bash
open index.html               # or double-click it
# …or serve it locally (enables the service worker)
python3 -m http.server 8000   # http://localhost:8000
```

## Hosting on GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch.**
3. Pick the branch and the `/ (root)` folder, then **Save**.
4. Live at `https://<user>.github.io/<repo>/`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The app — HTML, liquid-glass CSS (light + dark), QR library (MIT, Kazuhiko Arase) and all JS |
| `sw.js` | Service worker: offline cache |
| `manifest.webmanifest` | PWA install manifest |
| `icon.svg` | App icon |
