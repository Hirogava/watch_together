import { io } from "socket.io-client";

const socket = io("https://watch-together-4yot.onrender.com");
const roomId = location.hash.slice(1) || crypto.randomUUID();
location.hash = roomId;

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

  if (state.url.includes("youtube.com") || state.url.includes("youtu.be")) {
    const iframe = document.createElement("iframe");
    iframe.src = state.url.replace("watch?v=", "embed/");
    iframe.allow = "autoplay";
    iframe.allowFullscreen = true;
    player.appendChild(iframe);
    return;
  }

  video = document.createElement("video");
  video.src = state.url;
  video.controls = true;

  video.onplay = sendSync;
  video.onpause = sendSync;
  video.onseeked = sendSync;

  player.appendChild(video);
  syncVideo();
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
