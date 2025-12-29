import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};

io.on("connection", socket => {
  socket.on("join", roomId => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        url: "",
        time: 0,
        playing: false
      };
    }

    socket.emit("state", rooms[roomId]);
  });

  socket.on("state", s => {
    state = s;
    urlInput.value = state.url;
    loadVideo();
    });

  socket.on("sync", ({ roomId, state }) => {
    rooms[roomId] = state;
    socket.to(roomId).emit("sync", state);
  });
});

server.listen(3001, () => {
  console.log("Server on http://localhost:3001");
});
