/* ==========================================================================
   ДУУТАА-MN — үндсэн тоглоомын логик
   Heardle загварын дуу таах тоглоом — зөвхөн Монгол дуунуудаар
   ========================================================================== */

const DURATIONS = [0.1, 0.5, 2, 8, 15];   // секундүүд — дараалсан таах хэсгүүд
const POINTS    = [5, 4, 3, 2, 1];        // тухайн хэсэгт зөв тааснаар өгөх оноо

/* ---------- Текст харьцуулах (Монгол/Латин хоёуланг зөвшөөрнө) ---------- */

function normalizeText(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function isGuessCorrect(guess, song) {
  const g = normalizeText(guess);
  if (!g || g.length < 2) return false;
  const candidates = [song.title, song.artist, ...(song.answers || [])]
    .filter(Boolean)
    .map(normalizeText);
  for (const c of candidates) {
    if (!c) continue;
    if (g === c) return true;
    if (g.length >= 3 && (c.includes(g) || g.includes(c))) return true;
    const threshold = Math.max(1, Math.floor(c.length * 0.25));
    if (levenshtein(g, c) <= threshold) return true;
  }
  return false;
}

/* ------------------------------ YouTube ---------------------------------- */

let ytPlayer = null;
let ytReady = false;
let pendingReadyCbs = [];
let clipTimer = null;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player("yt-player", {
    height: "1",
    width: "1",
    playerVars: { controls: 0, disablekb: 1, modestbranding: 1, rel: 0, playsinline: 1, fs: 0 },
    events: {
      onReady: () => {
        ytReady = true;
        pendingReadyCbs.forEach(cb => cb());
        pendingReadyCbs = [];
      }
    }
  });
}

function whenYtReady(cb) {
  if (ytReady) cb();
  else pendingReadyCbs.push(cb);
}

function loadSongIntoPlayer(song) {
  return new Promise((resolve) => {
    whenYtReady(() => {
      const handler = (e) => {
        if (e.data === YT.PlayerState.CUED) {
          ytPlayer.removeEventListener("onStateChange", handler);
          resolve();
        }
      };
      ytPlayer.addEventListener("onStateChange", handler);
      ytPlayer.mute(); // зарим browser autoplay-г мутаар эхлүүлдэг тул нээгээд шууд unmute хийнэ
      ytPlayer.cueVideoById({ videoId: song.youtubeId, startSeconds: song.start });
      setTimeout(() => ytPlayer.unMute(), 300);
    });
  });
}

function playClip(song, duration, onEnd) {
  clearTimeout(clipTimer);
  try {
    ytPlayer.unMute();
    ytPlayer.seekTo(song.start, true);
    ytPlayer.playVideo();
  } catch (e) { /* player might not be ready yet */ }
  clipTimer = setTimeout(() => {
    try { ytPlayer.pauseVideo(); } catch (e) {}
    if (onEnd) onEnd();
  }, Math.round(duration * 1000));
}

function stopClip() {
  clearTimeout(clipTimer);
  try { ytPlayer.pauseVideo(); } catch (e) {}
}

/* --------------------------- Round Controller ----------------------------
   Нэг дуу таах "раунд"-ыг удирддаг. Ганцаарчилсан горим, найзуудтай нэг
   утсаар тоглох (quizmaster) горим, онлайн өрөөний горим — бүгд үүнийг
   ашиглана.
---------------------------------------------------------------------------- */

class RoundController {
  constructor(song) {
    this.song = song;
    this.levelIndex = 0;      // 0..4  ->  DURATIONS[levelIndex]
    this.finished = false;
    this.result = null;       // { correct: bool, levelIndex, points }
    this.history = [];        // хийсэн таамаглалууд
  }

  currentDuration() {
    return DURATIONS[this.levelIndex];
  }

  async load() {
    await loadSongIntoPlayer(this.song);
  }

  play(onEnd) {
    playClip(this.song, this.currentDuration(), onEnd);
  }

  guess(text) {
    if (this.finished) return null;
    const correct = isGuessCorrect(text, this.song);
    this.history.push({ text, correct, levelIndex: this.levelIndex });
    if (correct) {
      this.finished = true;
      this.result = { correct: true, levelIndex: this.levelIndex, points: POINTS[this.levelIndex] };
      stopClip();
      return this.result;
    }
    return this._advance();
  }

  skip() {
    if (this.finished) return null;
    this.history.push({ text: null, correct: false, levelIndex: this.levelIndex });
    return this._advance();
  }

  _advance() {
    if (this.levelIndex >= DURATIONS.length - 1) {
      this.finished = true;
      this.result = { correct: false, levelIndex: this.levelIndex, points: 0 };
      stopClip();
      return this.result;
    }
    this.levelIndex += 1;
    return { correct: false, advanced: true, levelIndex: this.levelIndex };
  }
}

/* ------------------------------- Дуу сонгох ------------------------------- */

function shuffledSongs() {
  const arr = [...ACTIVE_SONGS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* Дараагийн файлууд (ui-solo.js, ui-party.js, firebase-room.js) энэ файлын
   класс/функцүүдийг ашиглана. */
