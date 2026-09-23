/* ==========================================================================
   Дуу таах нэг раундын UI — ганцаарчилсан болон онлайн горимд хамтдаа ашиглана
   ========================================================================== */

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function fmtDuration(d) {
  return d < 1 ? `${Math.round(d * 1000)}мс` : `${d}с`;
}

/**
 * container: HTMLElement — раундын UI-г үүнд зурна
 * controller: RoundController
 * opts.onFinish(result) — раунд дуусахад дуудагдана
 * opts.hideGuessInput — true бол таамаглах input харагдахгүй (зөвхөн сонсох horim-д)
 */
function renderRoundUI(container, controller, opts = {}) {
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "round-card";

  const dots = document.createElement("div");
  dots.className = "level-dots";
  DURATIONS.forEach((d, i) => {
    const dot = document.createElement("div");
    dot.className = "level-dot" + (i === controller.levelIndex ? " current" : i < controller.levelIndex ? " used" : "");
    dot.innerHTML = `<span class="dot-time">${fmtDuration(d)}</span><span class="dot-pts">${POINTS[i]}p</span>`;
    dots.appendChild(dot);
  });
  card.appendChild(dots);

  const playBtn = document.createElement("button");
  playBtn.className = "btn btn-play";
  playBtn.textContent = `▶ Сонсох (${fmtDuration(controller.currentDuration())})`;
  playBtn.onclick = () => {
    playBtn.disabled = true;
    playBtn.textContent = "🔊 Тоглож байна…";
    controller.play(() => {
      playBtn.disabled = false;
      playBtn.textContent = `▶ Дахин сонсох (${fmtDuration(controller.currentDuration())})`;
    });
  };
  card.appendChild(playBtn);

  const feedback = document.createElement("div");
  feedback.className = "feedback";
  card.appendChild(feedback);

  if (!opts.hideGuessInput) {
    const form = document.createElement("form");
    form.className = "guess-form";
    form.innerHTML = `
      <input type="text" class="guess-input" list="song-titles-list" autocomplete="off"
             placeholder="Дууны нэр эсвэл дуучин/хамтлагийг бич..." />
      <button type="submit" class="btn btn-guess">Шалгах</button>
      <button type="button" class="btn btn-skip">Алгасах</button>
    `;
    card.appendChild(form);

    const input = form.querySelector(".guess-input");
    const skipBtn = form.querySelector(".btn-skip");

    const finishIfNeeded = (result) => {
      if (result && result.finished !== false && controller.finished) {
        renderResult(card, controller);
        input.disabled = true;
        skipBtn.disabled = true;
        playBtn.disabled = true;
        opts.onFinish && opts.onFinish(controller.result);
      } else {
        renderRoundUI(container, controller, opts); // дараагийн level рүү шинэчилж дүрслэнэ
      }
    };

    form.onsubmit = (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      const result = controller.guess(val);
      if (result.correct) {
        feedback.textContent = "🎉 Зөв байна!";
        feedback.className = "feedback ok";
        finishIfNeeded(result);
      } else if (controller.finished) {
        feedback.textContent = "😕 Дараагийн хэсэг байхгүй.";
        finishIfNeeded(result);
      } else {
        input.value = "";
        finishIfNeeded(result);
      }
    };

    skipBtn.onclick = () => {
      const result = controller.skip();
      finishIfNeeded(result);
    };
  }

  container.appendChild(card);
  return card;
}

function renderResult(card, controller) {
  const box = document.createElement("div");
  box.className = "result-box " + (controller.result.correct ? "ok" : "fail");
  box.innerHTML = `
    <div class="result-title">${controller.result.correct ? `+${controller.result.points} оноо` : "Тааж чадсангүй"}</div>
    <div class="result-song">${controller.song.title} — ${controller.song.artist}</div>
  `;
  card.appendChild(box);
}

function buildSongDatalist() {
  let dl = document.getElementById("song-titles-list");
  if (!dl) {
    dl = document.createElement("datalist");
    dl.id = "song-titles-list";
    document.body.appendChild(dl);
  }
  dl.innerHTML = ACTIVE_SONGS.map(s => `<option value="${s.title}">`).join("");
}
