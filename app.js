/* ============================================================
   RallyGlass — racquet sports scoring
   Live point-by-point scoring + tournament standings.
   Vanilla JS, persisted to localStorage. No build step.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- sport definitions ---------------- */
  // engine "tennis": points 15/30/40, games, sets, tiebreak (also padel)
  // engine "race":   rally points to a target, best-of-N games
  const SPORTS = {
    tennis: {
      name: "Tennis", icon: "🎾", engine: "tennis",
      setsToWin: 2, gamesToWin: 6, tiebreakTo: 7,
      desc: "15/30/40 · sets & games · tiebreak at 6-6",
    },
    padel: {
      name: "Padel", icon: "🟡", engine: "tennis",
      setsToWin: 2, gamesToWin: 6, tiebreakTo: 7,
      desc: "Tennis-style scoring · best of 3 sets",
    },
    pickleball: {
      name: "Pickleball", icon: "🥒", engine: "race",
      pointsToWin: 11, winBy: 2, gamesToWin: 2,
      desc: "To 11, win by 2 · best of 3 games",
    },
    badminton: {
      name: "Badminton", icon: "🏸", engine: "race",
      pointsToWin: 21, winBy: 2, cap: 30, gamesToWin: 2,
      desc: "To 21, cap 30 · best of 3 games",
    },
    squash: {
      name: "Squash", icon: "🟠", engine: "race",
      pointsToWin: 11, winBy: 2, gamesToWin: 3,
      desc: "To 11, win by 2 · best of 5 games",
    },
  };

  /* ---------------- storage ---------------- */
  const KEY = "rallyglass_v1";
  const defaultStore = () => ({ live: null, tournaments: [], history: [] });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultStore();
      const s = JSON.parse(raw);
      return Object.assign(defaultStore(), s);
    } catch (e) {
      return defaultStore();
    }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }

  let store = load();
  const ui = { tab: "live", tournamentId: null }; // transient view state

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ============================================================
     SCORING ENGINES
     Each takes a config + point log (array of 0/1 = which side won
     the point) and returns a normalized scoreboard state.
     Recomputing from the log makes undo trivial.
     ============================================================ */

  function tennisPointLabels(points) {
    const [a, b] = points;
    const names = ["0", "15", "30", "40"];
    if (a >= 3 && b >= 3) {
      if (a === b) return ["40", "40"];        // deuce
      if (a > b) return ["Ad", "40"];
      return ["40", "Ad"];
    }
    return [names[Math.min(a, 3)], names[Math.min(b, 3)]];
  }

  function computeTennis(cfg, log, bestOf) {
    const setsToWin = bestOf === 5 ? 3 : 2;
    let setsWon = [0, 0], games = [0, 0], points = [0, 0];
    const completedSets = [];
    let complete = false, winner = null;

    for (const w of log) {
      if (complete) break;
      const l = w ^ 1;
      const inTiebreak = games[0] === cfg.gamesToWin && games[1] === cfg.gamesToWin;
      points[w]++;

      if (inTiebreak) {
        if (points[w] >= cfg.tiebreakTo && points[w] - points[l] >= 2) {
          games[w]++;
          completedSets.push([games[0], games[1]]);
          setsWon[w]++; games = [0, 0]; points = [0, 0];
          if (setsWon[w] >= setsToWin) { complete = true; winner = w; }
        }
      } else if (points[w] >= 4 && points[w] - points[l] >= 2) {
        games[w]++; points = [0, 0];
        if (games[w] >= cfg.gamesToWin && games[w] - games[l] >= 2) {
          completedSets.push([games[0], games[1]]);
          setsWon[w]++; games = [0, 0];
          if (setsWon[w] >= setsToWin) { complete = true; winner = w; }
        }
      }
    }

    const inTiebreak = games[0] === cfg.gamesToWin && games[1] === cfg.gamesToWin;
    return {
      engine: "tennis", complete, winner,
      majorLabel: "Sets", major: setsWon.slice(),
      minorLabel: "Games", minor: games.slice(),
      pointLabel: inTiebreak ? "T-Break" : "Points",
      points: inTiebreak ? points.map(String) : tennisPointLabels(points),
      completed: completedSets.map((s) => s.join("-")),
    };
  }

  function computeRace(cfg, log) {
    let gamesWon = [0, 0], points = [0, 0];
    const completed = [];
    let complete = false, winner = null;

    for (const w of log) {
      if (complete) break;
      const l = w ^ 1;
      points[w]++;
      const reached = points[w] >= cfg.pointsToWin && points[w] - points[l] >= 2;
      const capped = cfg.cap && points[w] >= cfg.cap;
      if (reached || capped) {
        gamesWon[w]++;
        completed.push([points[0], points[1]]);
        points = [0, 0];
        if (gamesWon[w] >= cfg.gamesToWin) { complete = true; winner = w; }
      }
    }

    return {
      engine: "race", complete, winner,
      majorLabel: "Games", major: gamesWon.slice(),
      minorLabel: null, minor: null,
      pointLabel: "Points", points: points.map(String),
      completed: completed.map((s) => s.join("-")),
    };
  }

  function computeMatch(match) {
    const cfg = SPORTS[match.sport];
    if (!cfg) return null;
    return cfg.engine === "tennis"
      ? computeTennis(cfg, match.log, match.bestOf)
      : computeRace(cfg, match.log);
  }

  /* ============================================================
     LIVE SCORING TAB
     ============================================================ */
  const liveEl = document.getElementById("tab-live");

  // draft setup state (before a match starts)
  let draft = { sport: "tennis", bestOf: 3 };

  function renderLive() {
    if (store.live) return renderScoreboard();
    renderSetup();
  }

  function renderSetup() {
    const sportChips = Object.entries(SPORTS).map(([key, s]) => `
      <button class="sport-chip ${draft.sport === key ? "is-active" : ""}" data-sport="${key}">
        <div class="ico">${s.icon}</div>
        <div class="nm">${s.name}</div>
        <div class="ds">${s.desc}</div>
      </button>`).join("");

    const isTennis = SPORTS[draft.sport].engine === "tennis";
    const historyHtml = renderRecentHistory();

    liveEl.innerHTML = `
      <div class="card glass">
        <h2>New match</h2>
        <p class="sub">Pick a sport, name the players or teams, then record every point.</p>

        <p class="section-title">Sport</p>
        <div class="sport-grid">${sportChips}</div>

        ${isTennis ? `
        <div class="field" style="margin-top:16px;">
          <label>Match format</label>
          <select id="bestOf">
            <option value="3" ${draft.bestOf === 3 ? "selected" : ""}>Best of 3 sets</option>
            <option value="5" ${draft.bestOf === 5 ? "selected" : ""}>Best of 5 sets</option>
          </select>
        </div>` : ""}

        <hr class="divider" />
        <div class="inline-form">
          <div class="field">
            <label>Player / Team 1</label>
            <input type="text" id="p1" placeholder="e.g. Alcaraz" maxlength="40" />
          </div>
          <div class="field">
            <label>Player / Team 2</label>
            <input type="text" id="p2" placeholder="e.g. Sinner" maxlength="40" />
          </div>
        </div>
        <div class="spacer"></div>
        <button class="btn primary block" id="startMatch">Start scoring</button>
      </div>
      ${historyHtml}
    `;
  }

  function renderRecentHistory() {
    if (!store.history.length) return "";
    const items = store.history.slice(0, 5).map((h) => `
      <div class="row-item">
        <div class="main">
          <div class="ttl">${SPORTS[h.sport] ? SPORTS[h.sport].icon : "🎾"} ${esc(h.winnerName)} <span style="color:var(--text-faint)">def.</span> ${esc(h.loserName)}</div>
          <div class="meta">${esc(h.score)} · ${new Date(h.date).toLocaleDateString()}</div>
        </div>
      </div>`).join("");
    return `
      <div class="card glass">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <p class="section-title" style="margin:0;">Recent results</p>
          <button class="btn ghost small" id="clearHistory">Clear</button>
        </div>
        <div class="spacer"></div>
        <div class="list">${items}</div>
      </div>`;
  }

  function renderScoreboard() {
    const m = store.live;
    const cfg = SPORTS[m.sport];
    const st = computeMatch(m);
    const names = m.teams;

    const cell = (label, val, cls) =>
      `<div class="sb-cell ${cls || ""}"><div class="lbl">${label}</div><div class="val">${val}</div></div>`;

    function scoreCells(side) {
      let cells = "";
      if (st.minor) cells += cell(st.minorLabel, st.minor[side], "");
      cells += cell(st.majorLabel, st.major[side], "major");
      if (!st.complete) cells += cell(st.pointLabel, st.points[side], "point");
      return cells;
    }

    const row = (side) => {
      const isWinner = st.complete && st.winner === side;
      return `
        <div class="sb-row ${isWinner ? "winner" : ""}">
          <div class="sb-name">
            <div class="name">${esc(names[side])}</div>
            ${isWinner ? '<div class="tag">WINNER</div>' : ""}
          </div>
          <div class="sb-scores">${scoreCells(side)}</div>
        </div>`;
    };

    const setsDone = st.completed.length
      ? `<div class="sb-sets-done">${st.completed
          .map((s, i) => `<span class="set-chip">${st.majorLabel === "Sets" ? "Set" : "Game"} ${i + 1}: ${s}</span>`)
          .join("")}</div>`
      : "";

    let bottom;
    if (st.complete) {
      bottom = `
        <div class="winner-banner">
          <div class="cup">🏆</div>
          <div class="who">${esc(names[st.winner])}</div>
          <div class="txt">wins the match</div>
        </div>
        <div class="sb-sub-actions">
          <button class="btn primary grow" id="saveResult">Save result</button>
          <button class="btn ghost" id="undoPoint">Undo</button>
          <button class="btn danger" id="discardMatch">Discard</button>
        </div>`;
    } else {
      bottom = `
        <div class="sb-actions">
          <div class="point-btn a" data-point="0">
            <div class="pt">+ Point</div>
            <div class="who">${esc(names[0])}</div>
          </div>
          <div class="point-btn b" data-point="1">
            <div class="pt">+ Point</div>
            <div class="who">${esc(names[1])}</div>
          </div>
        </div>
        <div class="sb-sub-actions">
          <button class="btn ghost grow" id="undoPoint" ${m.log.length ? "" : "disabled"}>↩︎ Undo point</button>
          <button class="btn danger" id="discardMatch">End match</button>
        </div>`;
    }

    liveEl.innerHTML = `
      <div class="card glass scoreboard">
        <div class="sb-top">
          <div class="meta"><span class="ico">${cfg.icon}</span> ${cfg.name}</div>
          <span class="badge">${cfg.engine === "tennis" ? "Best of " + m.bestOf + " sets" : "Best of " + (cfg.gamesToWin * 2 - 1) + " games"}</span>
        </div>
        <div class="sb-players">
          ${row(0)}
          ${row(1)}
        </div>
        ${setsDone}
        ${bottom}
      </div>
    `;
  }

  /* ---- live actions ---- */
  function startMatch() {
    const p1 = (document.getElementById("p1").value || "").trim() || "Player 1";
    const p2 = (document.getElementById("p2").value || "").trim() || "Player 2";
    const bestOfEl = document.getElementById("bestOf");
    store.live = {
      sport: draft.sport,
      teams: [p1, p2],
      bestOf: bestOfEl ? parseInt(bestOfEl.value, 10) : 3,
      log: [],
      date: Date.now(),
    };
    save();
    renderLive();
  }

  function addPoint(side) {
    const m = store.live;
    if (!m) return;
    const st = computeMatch(m);
    if (st.complete) return;
    m.log.push(side);
    save();
    renderLive();
  }

  function undoPoint() {
    const m = store.live;
    if (!m || !m.log.length) return;
    m.log.pop();
    save();
    renderLive();
  }

  function saveResult() {
    const m = store.live;
    const st = computeMatch(m);
    if (!m || !st.complete) return;
    const loser = st.winner ^ 1;
    // build a readable score line from the winner's perspective
    const scoreLine = st.completed.length ? st.completed.join(", ") : st.major.join("-");
    store.history.unshift({
      id: uid(),
      sport: m.sport,
      winnerName: m.teams[st.winner],
      loserName: m.teams[loser],
      score: scoreLine,
      date: Date.now(),
    });
    store.history = store.history.slice(0, 20);
    store.live = null;
    save();
    renderLive();
  }

  function discardMatch() {
    if (store.live && store.live.log.length && !confirm("End and discard this match?")) return;
    store.live = null;
    save();
    renderLive();
  }

  // event delegation for the live panel
  liveEl.addEventListener("click", (e) => {
    const sportBtn = e.target.closest("[data-sport]");
    if (sportBtn) { draft.sport = sportBtn.dataset.sport; renderLive(); return; }

    const pointBtn = e.target.closest("[data-point]");
    if (pointBtn) { addPoint(parseInt(pointBtn.dataset.point, 10)); return; }

    if (e.target.closest("#startMatch")) return startMatch();
    if (e.target.closest("#undoPoint")) return undoPoint();
    if (e.target.closest("#saveResult")) return saveResult();
    if (e.target.closest("#discardMatch")) return discardMatch();
    if (e.target.closest("#clearHistory")) {
      if (confirm("Clear recent results?")) { store.history = []; save(); renderLive(); }
      return;
    }
  });
  liveEl.addEventListener("change", (e) => {
    if (e.target.id === "bestOf") { draft.bestOf = parseInt(e.target.value, 10); }
  });

  /* ============================================================
     TOURNAMENTS TAB
     ============================================================ */
  const tourEl = document.getElementById("tab-tournaments");

  function findTournament(id) { return store.tournaments.find((t) => t.id === id); }

  function renderTournaments() {
    if (ui.tournamentId && findTournament(ui.tournamentId)) {
      renderTournamentDetail(findTournament(ui.tournamentId));
    } else {
      ui.tournamentId = null;
      renderTournamentList();
    }
  }

  function renderTournamentList() {
    const sportOptions = Object.entries(SPORTS)
      .map(([k, s]) => `<option value="${k}">${s.icon} ${s.name}</option>`).join("");

    const list = store.tournaments.length
      ? store.tournaments.map((t) => {
          const cfg = SPORTS[t.sport] || SPORTS.tennis;
          return `
          <div class="row-item clickable" data-open="${t.id}">
            <div class="main">
              <div class="ttl">${cfg.icon} ${esc(t.name)}</div>
              <div class="meta">${t.teams.length} teams · ${t.matches.length} matches played</div>
            </div>
            <span class="pill">Open →</span>
          </div>`;
        }).join("")
      : `<div class="empty"><span class="big">🏆</span>No tournaments yet.<br/>Create one below to track team standings.</div>`;

    tourEl.innerHTML = `
      <div class="card glass">
        <h2>Create a tournament</h2>
        <p class="sub">Give it a name and pick the sport. You'll add teams and results next.</p>
        <div class="inline-form">
          <div class="field grow">
            <label>Tournament name</label>
            <input type="text" id="tName" placeholder="e.g. Summer Club Championship" maxlength="60" />
          </div>
          <div class="field">
            <label>Sport</label>
            <select id="tSport">${sportOptions}</select>
          </div>
        </div>
        <div class="spacer"></div>
        <button class="btn primary" id="createTournament">Create tournament</button>
      </div>

      <div class="card glass">
        <p class="section-title">Your tournaments</p>
        <div class="spacer"></div>
        <div class="list">${list}</div>
      </div>
    `;
  }

  function computeStandings(t) {
    const table = {};
    t.teams.forEach((name) => { table[name] = { name, P: 0, W: 0, L: 0, PF: 0, PA: 0 }; });
    t.matches.forEach((mt) => {
      const A = table[mt.teamA], B = table[mt.teamB];
      if (!A || !B) return;
      A.P++; B.P++;
      A.PF += mt.scoreA; A.PA += mt.scoreB;
      B.PF += mt.scoreB; B.PA += mt.scoreA;
      if (mt.scoreA > mt.scoreB) { A.W++; B.L++; }
      else if (mt.scoreB > mt.scoreA) { B.W++; A.L++; }
    });
    return Object.values(table).sort((a, b) =>
      b.W - a.W || (b.PF - b.PA) - (a.PF - a.PA) || b.PF - a.PF || a.name.localeCompare(b.name));
  }

  function renderTournamentDetail(t) {
    const cfg = SPORTS[t.sport] || SPORTS.tennis;

    const teamChips = t.teams.length
      ? t.teams.map((name) => `
        <span class="team-chip">${esc(name)}
          <button data-remove-team="${esc(name)}" title="Remove team">×</button>
        </span>`).join("")
      : `<span class="hint">No teams yet — add your first team above.</span>`;

    const teamSelect = t.teams.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join("");
    const canRecord = t.teams.length >= 2;

    const matchList = t.matches.length
      ? t.matches.slice().reverse().map((mt) => {
          const aWon = mt.scoreA > mt.scoreB;
          const bWon = mt.scoreB > mt.scoreA;
          return `
          <div class="row-item">
            <div class="main">
              <div class="ttl">
                <span style="color:${aWon ? "var(--good)" : "inherit"}">${esc(mt.teamA)}</span>
                <span style="color:var(--text-faint)"> ${mt.scoreA} – ${mt.scoreB} </span>
                <span style="color:${bWon ? "var(--good)" : "inherit"}">${esc(mt.teamB)}</span>
              </div>
              <div class="meta">${new Date(mt.date).toLocaleDateString()}</div>
            </div>
            <button class="btn ghost small" data-del-match="${mt.id}">Delete</button>
          </div>`;
        }).join("")
      : `<div class="empty">No matches recorded yet.</div>`;

    const standings = computeStandings(t);
    const standingsRows = standings.map((s, i) => `
      <tr>
        <td class="team"><span class="rank">${i + 1}</span>${esc(s.name)}</td>
        <td>${s.P}</td>
        <td class="w">${s.W}</td>
        <td>${s.L}</td>
        <td>${s.PF}</td>
        <td>${s.PA}</td>
        <td>${s.PF - s.PA > 0 ? "+" : ""}${s.PF - s.PA}</td>
        <td class="pts">${s.W * 2}</td>
      </tr>`).join("");

    tourEl.innerHTML = `
      <button class="back-link" id="backToList">← All tournaments</button>

      <div class="card glass">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div>
            <h2>${cfg.icon} ${esc(t.name)}</h2>
            <p class="sub">${cfg.name} · ${t.teams.length} teams · ${t.matches.length} matches</p>
          </div>
          <button class="btn danger small" id="deleteTournament">Delete</button>
        </div>

        <p class="section-title">Teams</p>
        <div class="inline-form">
          <div class="field grow">
            <label>Add a team</label>
            <input type="text" id="teamName" placeholder="Team or player name" maxlength="40" />
          </div>
          <button class="btn" id="addTeam">Add team</button>
        </div>
        <div class="spacer"></div>
        <div class="chips">${teamChips}</div>
      </div>

      <div class="card glass">
        <p class="section-title">Record a result</p>
        ${canRecord ? `
        <div class="inline-form">
          <div class="field">
            <label>Team 1</label>
            <select id="mTeamA">${teamSelect}</select>
          </div>
          <div class="field" style="flex:0 0 90px;">
            <label>Score</label>
            <input type="number" id="mScoreA" min="0" step="1" placeholder="0" />
          </div>
          <div class="field" style="flex:0 0 90px;">
            <label>Score</label>
            <input type="number" id="mScoreB" min="0" step="1" placeholder="0" />
          </div>
          <div class="field">
            <label>Team 2</label>
            <select id="mTeamB">${teamSelect}</select>
          </div>
        </div>
        <div class="spacer"></div>
        <button class="btn primary" id="recordMatch">Add result</button>
        <p class="hint">Enter the final score (games/sets/points won by each side). The higher score wins.</p>
        ` : `<div class="empty">Add at least two teams to start recording results.</div>`}
      </div>

      <div class="card glass">
        <p class="section-title">Standings</p>
        <div class="spacer"></div>
        ${standings.length ? `
        <div class="table-wrap">
          <table class="standings">
            <thead>
              <tr><th style="text-align:left;">Team</th><th>P</th><th>W</th><th>L</th><th>PF</th><th>PA</th><th>Diff</th><th>Pts</th></tr>
            </thead>
            <tbody>${standingsRows}</tbody>
          </table>
        </div>
        <p class="hint">P played · W won · L lost · PF points for · PA points against · Pts = 2 per win.</p>
        ` : `<div class="empty">Standings appear once teams are added.</div>`}
      </div>

      <div class="card glass">
        <p class="section-title">Match history</p>
        <div class="spacer"></div>
        <div class="list">${matchList}</div>
      </div>
    `;
  }

  /* ---- tournament actions ---- */
  function createTournament() {
    const name = (document.getElementById("tName").value || "").trim();
    const sport = document.getElementById("tSport").value;
    if (!name) { alert("Please enter a tournament name."); return; }
    const t = { id: uid(), name, sport, teams: [], matches: [], date: Date.now() };
    store.tournaments.unshift(t);
    ui.tournamentId = t.id;
    save();
    renderTournaments();
  }

  function addTeam(t) {
    const input = document.getElementById("teamName");
    const name = (input.value || "").trim();
    if (!name) return;
    if (t.teams.some((n) => n.toLowerCase() === name.toLowerCase())) {
      alert("That team is already in this tournament."); return;
    }
    t.teams.push(name);
    save();
    renderTournaments();
  }

  function removeTeam(t, name) {
    t.teams = t.teams.filter((n) => n !== name);
    save();
    renderTournaments();
  }

  function recordMatch(t) {
    const teamA = document.getElementById("mTeamA").value;
    const teamB = document.getElementById("mTeamB").value;
    const scoreA = parseInt(document.getElementById("mScoreA").value, 10);
    const scoreB = parseInt(document.getElementById("mScoreB").value, 10);
    if (teamA === teamB) { alert("Pick two different teams."); return; }
    if (isNaN(scoreA) || isNaN(scoreB)) { alert("Enter a score for both teams."); return; }
    if (scoreA === scoreB) { alert("A match can't end in a tie — enter a winning score."); return; }
    t.matches.push({ id: uid(), teamA, teamB, scoreA, scoreB, date: Date.now() });
    save();
    renderTournaments();
  }

  function deleteMatch(t, id) {
    t.matches = t.matches.filter((m) => m.id !== id);
    save();
    renderTournaments();
  }

  function deleteTournament(t) {
    if (!confirm(`Delete "${t.name}" and all its results?`)) return;
    store.tournaments = store.tournaments.filter((x) => x.id !== t.id);
    ui.tournamentId = null;
    save();
    renderTournaments();
  }

  tourEl.addEventListener("click", (e) => {
    if (e.target.closest("#createTournament")) return createTournament();

    const openBtn = e.target.closest("[data-open]");
    if (openBtn) { ui.tournamentId = openBtn.dataset.open; renderTournaments(); return; }

    if (e.target.closest("#backToList")) { ui.tournamentId = null; renderTournaments(); return; }

    const t = ui.tournamentId && findTournament(ui.tournamentId);
    if (!t) return;

    if (e.target.closest("#addTeam")) return addTeam(t);
    if (e.target.closest("#recordMatch")) return recordMatch(t);
    if (e.target.closest("#deleteTournament")) return deleteTournament(t);

    const rmTeam = e.target.closest("[data-remove-team]");
    if (rmTeam) return removeTeam(t, rmTeam.dataset.removeTeam);

    const delMatch = e.target.closest("[data-del-match]");
    if (delMatch) return deleteMatch(t, delMatch.dataset.delMatch);
  });

  // enter-to-add on team & tournament name inputs
  tourEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (e.target.id === "teamName") {
      const t = ui.tournamentId && findTournament(ui.tournamentId);
      if (t) { e.preventDefault(); addTeam(t); }
    } else if (e.target.id === "tName") {
      e.preventDefault(); createTournament();
    }
  });
  liveEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.target.id === "p1" || e.target.id === "p2")) {
      e.preventDefault(); startMatch();
    }
  });

  /* ============================================================
     TAB SWITCHING + BOOT
     ============================================================ */
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      ui.tab = btn.dataset.tab;
      document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("is-active", b === btn));
      document.querySelectorAll(".tab-panel").forEach((p) =>
        p.classList.toggle("is-active", p.id === "tab-" + ui.tab));
      if (ui.tab === "live") renderLive(); else renderTournaments();
    });
  });

  renderLive();
  renderTournaments();
})();
