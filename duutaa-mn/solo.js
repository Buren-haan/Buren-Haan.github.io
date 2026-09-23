/* ============================== Ганцаарчилсан горим ============================== */

const SoloSession = {
  queue: [],
  total: 0,
  playedCount: 0,
  results: [],

  start() {
    if (ACTIVE_SONGS.length === 0) {
      alert("Дууны сан хоосон байна. songs.js файлд дуу нэмнэ үү.");
      return;
    }
    this.queue = shuffledSongs();
    this.total = 0;
    this.playedCount = 0;
    this.results = [];
    showScreen("screen-solo");
    this.nextRound();
  },

  nextRound() {
    if (this.queue.length === 0) {
      this.finish();
      return;
    }
    const song = this.queue.shift();
    const controller = new RoundController(song);
    const container = document.getElementById("solo-round");
    container.innerHTML = `<div class="loading">Ачааллаж байна…</div>`;
    controller.load().then(() => {
      renderRoundUI(container, controller, {
        onFinish: (result) => {
          this.total += result.points;
          this.playedCount += 1;
          this.results.push({ song, result });
          document.getElementById("solo-score").textContent = this.total;
          const nextArea = document.getElementById("solo-next-area");
          nextArea.innerHTML = "";
          const nextBtn = document.createElement("button");
          nextBtn.className = "btn btn-primary";
          nextBtn.textContent = this.queue.length ? "Дараагийн дуу →" : "Тоглоомыг дуусгах";
          nextBtn.onclick = () => this.nextRound();
          nextArea.appendChild(nextBtn);

          const endBtn = document.createElement("button");
          endBtn.className = "btn btn-ghost";
          endBtn.textContent = "Энд зогсоох";
          endBtn.onclick = () => this.finish();
          nextArea.appendChild(endBtn);
        }
      });
    });
  },

  finish() {
    showScreen("screen-solo-summary");
    document.getElementById("solo-summary-score").textContent = this.total;
    document.getElementById("solo-summary-count").textContent = this.playedCount;
    const list = document.getElementById("solo-summary-list");
    list.innerHTML = this.results.map(r => `
      <li class="${r.result.correct ? "ok" : "fail"}">
        <span>${r.song.title} — ${r.song.artist}</span>
        <span>${r.result.correct ? "+" + r.result.points : "0"}</span>
      </li>`).join("");
  }
};
