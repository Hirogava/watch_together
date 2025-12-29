const socket = io("https://watch-together-4yot.onrender.com");
const roomId = "1";


const urlInput = document.getElementById("url");
const player = document.getElementById("player");

let video;
let state = {
  url: "",
  time: 0,
  playing: false
};

socket.emit("join", roomId);

socket.on("state", s => {
  state = s;
  loadVideo();
});

socket.on("sync", s => {
  state = s;
  syncVideo();
});

urlInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    state.url = urlInput.value;
    state.time = 0;
    state.playing = false;
    socket.emit("sync", { roomId, state });
    loadVideo();
  }
});

function loadVideo() {
  player.innerHTML = "";

  if (!state.url) return;

  // YouTube
  if (state.url.includes("youtube.com") || state.url.includes("youtu.be")) {
    const videoId = extractYouTubeId(state.url);
    if (!videoId) return;

    const iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "500";
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0`;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    player.appendChild(iframe);
    return;
  }

  // Обычное видео
  video = document.createElement("video");
  video.src = state.url;
  video.controls = true;

  video.onplay = sendSync;
  video.onpause = sendSync;
  video.onseeked = sendSync;

  player.appendChild(video);
  syncVideo();
}

function extractYouTubeId(url) {
  const reg =
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(reg);
  return match ? match[1] : null;
}

function sendSync() {
  state.time = video.currentTime;
  state.playing = !video.paused;
  socket.emit("sync", { roomId, state });
}

function syncVideo() {
  if (!video) return;
  video.currentTime = state.time;
  state.playing ? video.play() : video.pause();
}
