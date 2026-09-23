/* ==================================== main ==================================== */

document.addEventListener("DOMContentLoaded", () => {
  buildSongDatalist();
  FirebaseRoom.init();

  document.getElementById("song-count-badge").textContent = ACTIVE_SONGS.length;

  // --- Нүүр цэс ---
  document.getElementById("btn-solo").onclick = () => SoloSession.start();
  document.getElementById("btn-party").onclick = () => {
    PartyGame.players = [];
    PartyGame.renderSetupList();
    showScreen("screen-party-setup");
  };
  document.getElementById("btn-online").onclick = () => {
    if (!FirebaseRoom.available) {
      showScreen("screen-online-unavailable");
    } else {
      showScreen("screen-online-lobby");
    }
  };
  document.querySelectorAll(".btn-back-home").forEach(b => b.onclick = () => { stopClip(); showScreen("screen-home"); });

  // --- Party тохиргоо ---
  document.getElementById("party-add-form").onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById("party-name-input");
    PartyGame.addPlayer(input.value);
    input.value = "";
    input.focus();
  };
  document.getElementById("btn-party-start").onclick = () => PartyGame.start();
  document.getElementById("btn-party-again").onclick = () => showScreen("screen-party-setup");

  // --- Solo дахин тоглох ---
  document.getElementById("btn-solo-again").onclick = () => SoloSession.start();

  // --- Online тохиргоо ---
  document.getElementById("online-create-form").onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById("online-create-name").value.trim();
    const rounds = parseInt(document.getElementById("online-rounds-select").value, 10);
    if (!name) return;
    try {
      await OnlineGame.createRoom(name, rounds);
    } catch (err) {
      alert("Алдаа: " + err.message);
    }
  };
  document.getElementById("online-join-form").onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById("online-join-name").value.trim();
    const code = document.getElementById("online-join-code").value.trim();
    if (!name || !code) return;
    try {
      await OnlineGame.joinRoom(code, name);
    } catch (err) {
      alert("Алдаа: " + err.message);
    }
  };
  document.getElementById("btn-online-start-game").onclick = () => {
    FirebaseRoom.startGame(OnlineGame.code);
  };
});
