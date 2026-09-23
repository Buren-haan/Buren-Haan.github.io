/* ============================== Онлайн өрөөний UI ============================== */

const OnlineGame = {
  code: null,
  playerId: null,
  isHost: false,
  roomData: null,
  loadedRound: -1,
  unlisten: null,

  async createRoom(name, roundsTotal) {
    const { code, playerId } = await FirebaseRoom.createRoom(name, roundsTotal);
    this.code = code; this.playerId = playerId; this.isHost = true;
    this.enterLobby();
  },

  async joinRoom(code, name) {
    const res = await FirebaseRoom.joinRoom(code, name);
    this.code = res.code; this.playerId = res.playerId; this.isHost = res.isHost;
    this.enterLobby();
  },

  enterLobby() {
    showScreen("screen-online-lobby-waiting");
    document.getElementById("online-room-code").textContent = this.code;
    document.getElementById("online-host-controls").style.display = this.isHost ? "block" : "none";
    this.unlisten = FirebaseRoom.listenRoom(this.code, data => this.onRoomUpdate(data));
  },

  onRoomUpdate(data) {
    if (!data) return;
    this.roomData = data;

    if (data.phase === "lobby") {
      const list = document.getElementById("online-lobby-players");
      const names = Object.values(data.players || {}).map(p => p.name);
      list.innerHTML = names.map(n => `<li>${n}</li>`).join("");
      return;
    }

    if (data.phase === "playing") {
      if (document.getElementById("screen-online-game").classList.contains("active") === false) {
        showScreen("screen-online-game");
      }
      if (this.loadedRound !== data.currentRound) {
        this.loadedRound = data.currentRound;
        this.loadRound(data.currentRound, data.songOrder[data.currentRound]);
      }
      this.renderStatus();
      return;
    }

    if (data.phase === "finished") {
      this.showFinal();
    }
  },

  loadRound(roundIndex, songId) {
    const song = ACTIVE_SONGS.find(s => s.id === songId);
    const container = document.getElementById("online-round");
    container.innerHTML = `<div class="loading">Ачааллаж байна…</div>`;
    document.getElementById("online-round-no").textContent = `Дуу ${roundIndex + 1} / ${this.roomData.songOrder.length}`;
    if (!song) { container.innerHTML = `<div class="loading">Дуу олдсонгүй (устгагдсан байж магадгүй).</div>`; return; }
    const controller = new RoundController(song);
    controller.load().then(() => {
      renderRoundUI(container, controller, {
        onFinish: (result) => {
          FirebaseRoom.submitScore(this.code, this.playerId, roundIndex, result.points);
          this.renderStatus();
        }
      });
    });
  },

  renderStatus() {
    const data = this.roomData;
    if (!data) return;
    const players = Object.entries(data.players || {}).map(([id, p]) => ({ id, ...p }));
    const finishedCount = players.filter(p => p.scores && p.scores[data.currentRound] !== undefined).length;

    const statusEl = document.getElementById("online-status");
    const sorted = [...players].sort((a, b) => this.total(b) - this.total(a));
    statusEl.innerHTML = `
      <div class="waiting-line">${finishedCount}/${players.length} тоглогч энэ дууг дуусгасан</div>
      <h3>Онооны самбар</h3>
      <ol>${sorted.map(p => `<li><span>${p.name}${p.id === this.playerId ? " (та)" : ""}</span><span>${this.total(p)}</span></li>`).join("")}</ol>
      ${this.isHost ? `<button id="btn-online-next" class="btn btn-primary">${data.currentRound + 1 >= data.songOrder.length ? "Тоглоомыг дуусгах" : "Дараагийн дуу →"}</button>` : ""}
    `;
    if (this.isHost) {
      document.getElementById("btn-online-next").onclick = () => FirebaseRoom.advanceRound(this.code, data);
    }
  },

  total(player) {
    return Object.values(player.scores || {}).reduce((a, b) => a + b, 0);
  },

  showFinal() {
    if (this.unlisten) this.unlisten();
    showScreen("screen-online-finished");
    const players = Object.values(this.roomData.players || {});
    const sorted = players.sort((a, b) => this.total(b) - this.total(a));
    document.getElementById("online-final-list").innerHTML = sorted.map((p, i) => `
      <li class="${i === 0 ? "winner" : ""}">
        <span>${i === 0 ? "🏆" : i + 1 + "."} ${p.name}</span>
        <span>${this.total(p)}</span>
      </li>`).join("");
  }
};
