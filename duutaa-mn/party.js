/* ================= Найзуудтайгаа нэг утсаар (эзэн-даалгавартай горим) =================
   Бүгд ижил дуу сонсоод, хэн эхэлж таасныг тоглоом даалгаварлагч (host) гараар
   тэмдэглэнэ. Тиймээс энд бичгээр таамаглал оруулах шаардлагагүй.
   ======================================================================================= */

const PartyGame = {
  players: [],   // { id, name, total }
  queue: [],
  controller: null,
  roundNo: 0,

  addPlayer(name) {
    name = name.trim();
    if (!name) return;
    this.players.push({ id: "p" + Date.now() + Math.random().toString(36).slice(2, 6), name, total: 0 });
    this.renderSetupList();
  },

  removePlayer(id) {
    this.players = this.players.filter(p => p.id !== id);
    this.renderSetupList();
  },

  renderSetupList() {
    const list = document.getElementById("party-players-list");
    list.innerHTML = this.players.map(p => `
      <li>
        <span>${p.name}</span>
        <button class="btn-remove" data-id="${p.id}">✕</button>
      </li>`).join("");
    list.querySelectorAll(".btn-remove").forEach(btn => {
      btn.onclick = () => this.removePlayer(btn.dataset.id);
    });
    document.getElementById("btn-party-start").disabled = this.players.length < 1;
  },

  start() {
    if (ACTIVE_SONGS.length === 0) {
      alert("Дууны сан хоосон байна. songs.js файлд дуу нэмнэ үү.");
      return;
    }
    this.players.forEach(p => (p.total = 0));
    this.queue = shuffledSongs();
    this.roundNo = 0;
    showScreen("screen-party-game");
    this.nextRound();
  },

  nextRound() {
    if (this.queue.length === 0) return this.finish();
    const song = this.queue.shift();
    this.roundNo += 1;
    this.controller = new RoundController(song);
    const container = document.getElementById("party-round");
    container.innerHTML = `<div class="loading">Ачааллаж байна…</div>`;
    this.controller.load().then(() => this.renderRound());
    this.renderLeaderboard();
  },

  renderRound() {
    const container = document.getElementById("party-round");
    const ctrl = this.controller;
    const card = renderRoundUI(container, ctrl, { hideGuessInput: true });

    const controls = document.createElement("div");
    controls.className = "party-controls";

    const nextLevelBtn = document.createElement("button");
    nextLevelBtn.className = "btn btn-ghost";
    nextLevelBtn.textContent = ctrl.levelIndex < DURATIONS.length - 1
      ? `Хэн ч таагаагүй → дараагийн хэсэг рүү (${fmtDuration(DURATIONS[ctrl.levelIndex + 1])})`
      : "Сүүлийн хэсэг";
    nextLevelBtn.disabled = ctrl.levelIndex >= DURATIONS.length - 1;
    nextLevelBtn.onclick = () => {
      ctrl.skip();
      if (ctrl.finished) this.roundEnded();
      else this.renderRound();
    };
    controls.appendChild(nextLevelBtn);

    const revealBtn = document.createElement("button");
    revealBtn.className = "btn btn-ghost";
    revealBtn.textContent = "Хариултыг харуулах (0 оноо)";
    revealBtn.onclick = () => {
      ctrl.finished = true;
      ctrl.result = { correct: false, levelIndex: ctrl.levelIndex, points: 0 };
      stopClip();
      this.roundEnded();
    };
    controls.appendChild(revealBtn);
    card.appendChild(controls);

    const whoGot = document.createElement("div");
    whoGot.className = "who-got-it";
    whoGot.innerHTML = `<div class="who-got-label">Хэн эхэлж зөв таасан бэ?</div>`;
    const btnRow = document.createElement("div");
    btnRow.className = "who-got-row";
    this.players.forEach(p => {
      const b = document.createElement("button");
      b.className = "btn btn-player";
      b.textContent = `✓ ${p.name} (${POINTS[ctrl.levelIndex]}p)`;
      b.onclick = () => {
        ctrl.finished = true;
        ctrl.result = { correct: true, levelIndex: ctrl.levelIndex, points: POINTS[ctrl.levelIndex] };
        p.total += ctrl.result.points;
        stopClip();
        this.roundEnded(p);
      };
      btnRow.appendChild(b);
    });
    whoGot.appendChild(btnRow);
    card.appendChild(whoGot);
  },

  roundEnded(winner) {
    const container = document.getElementById("party-round");
    container.innerHTML = "";
    const card = document.createElement("div");
    card.className = "round-card";
    const box = document.createElement("div");
    box.className = "result-box " + (winner ? "ok" : "fail");
    box.innerHTML = `
      <div class="result-title">${winner ? `${winner.name} +${this.controller.result.points} оноо!` : "Хэн ч тааж чадсангүй"}</div>
      <div class="result-song">${this.controller.song.title} — ${this.controller.song.artist}</div>
    `;
    card.appendChild(box);
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-primary";
    nextBtn.textContent = this.queue.length ? "Дараагийн дуу →" : "Тоглоомыг дуусгах";
    nextBtn.onclick = () => this.nextRound();
    card.appendChild(nextBtn);
    container.appendChild(card);
    this.renderLeaderboard();
  },

  renderLeaderboard() {
    const el = document.getElementById("party-leaderboard");
    const sorted = [...this.players].sort((a, b) => b.total - a.total);
    el.innerHTML = `<h3>Онооны самбар</h3><ol>${sorted.map(p => `<li><span>${p.name}</span><span>${p.total}</span></li>`).join("")}</ol>`;
  },

  finish() {
    showScreen("screen-party-summary");
    const sorted = [...this.players].sort((a, b) => b.total - a.total);
    const el = document.getElementById("party-summary-list");
    el.innerHTML = sorted.map((p, i) => `
      <li class="${i === 0 ? "winner" : ""}">
        <span>${i === 0 ? "🏆" : i + 1 + "."} ${p.name}</span>
        <span>${p.total}</span>
      </li>`).join("");
  }
};
