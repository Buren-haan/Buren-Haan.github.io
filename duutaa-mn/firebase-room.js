/* ==========================================================================
   Онлайн өрөө — Firebase Realtime Database ашиглана.
   Тохиргоо хийхийн тулд firebase-config.js файлыг firebase-config.sample.js-ээс
   хуулж, өөрийн Firebase төслийн түлхүүрүүдийг бичнэ үү (README.md-г үзнэ үү).
   firebase-config.js байхгүй бол "Онлайн өрөө" горим идэвхгүй болно.
   ========================================================================== */

const FirebaseRoom = {
  db: null,
  available: false,

  init() {
    if (typeof firebaseConfig === "undefined" || !window.firebase) {
      this.available = false;
      return false;
    }
    try {
      firebase.initializeApp(firebaseConfig);
      this.db = firebase.database();
      this.available = true;
    } catch (e) {
      console.error("Firebase init алдаа:", e);
      this.available = false;
    }
    return this.available;
  },

  genCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // төстэй тэмдэгтийг хассан
    let code = "";
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  },

  genPlayerId() {
    return "pl" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  async createRoom(hostName, roundsTotal) {
    const code = this.genCode();
    const playerId = this.genPlayerId();
    const songOrder = shuffledSongs().slice(0, roundsTotal).map(s => s.id);
    await this.db.ref("rooms/" + code).set({
      hostId: playerId,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      phase: "lobby",
      roundsTotal: songOrder.length,
      currentRound: -1,
      songOrder,
      players: {
        [playerId]: { name: hostName, joinedAt: firebase.database.ServerValue.TIMESTAMP, scores: {} }
      }
    });
    return { code, playerId, isHost: true };
  },

  async joinRoom(code, name) {
    code = code.trim().toUpperCase();
    const snap = await this.db.ref("rooms/" + code).get();
    if (!snap.exists()) throw new Error("Ийм кодтой өрөө олдсонгүй.");
    const room = snap.val();
    if (room.phase !== "lobby") throw new Error("Энэ өрөөнд тоглоом эхэлчихсэн байна.");
    const playerId = this.genPlayerId();
    await this.db.ref(`rooms/${code}/players/${playerId}`).set({
      name, joinedAt: firebase.database.ServerValue.TIMESTAMP, scores: {}
    });
    return { code, playerId, isHost: false };
  },

  listenRoom(code, cb) {
    const ref = this.db.ref("rooms/" + code);
    ref.on("value", snap => cb(snap.val()));
    return () => ref.off("value");
  },

  startGame(code) {
    return this.db.ref("rooms/" + code).update({ phase: "playing", currentRound: 0 });
  },

  advanceRound(code, roomData) {
    const next = roomData.currentRound + 1;
    if (next >= roomData.songOrder.length) {
      return this.db.ref("rooms/" + code).update({ phase: "finished" });
    }
    return this.db.ref("rooms/" + code).update({ currentRound: next });
  },

  submitScore(code, playerId, roundIndex, points) {
    return this.db.ref(`rooms/${code}/players/${playerId}/scores/${roundIndex}`).set(points);
  }
};
