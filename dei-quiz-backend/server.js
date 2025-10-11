import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import quiz from "./quiz.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let rooms = {}; // { roomId: { players: {}, currentQuestionIndex, sharedTop: [] } }

app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

  io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // --- Host creates room ---
  socket.on("createRoom", () => {
    const roomId = socket.id;
    rooms[roomId] = { players: {}, currentQuestionIndex: -1, sharedTop: [] };
    socket.join(roomId);
    io.to(socket.id).emit("roomCreated", roomId);
  });

  // --- Player joins room ---
  socket.on("join", ({ roomId, name, img }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.players[socket.id] = { name, img, answers: [], sharedTop: null };
    socket.join(roomId);

    // Update everyone in room
    io.to(roomId).emit(
      "updatePlayers",
      Object.values(room.players).map((p) => ({ name: p.name, img: p.img }))
    );
  });

  // --- Host starts quiz ---
  socket.on("hostStart", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    // Reset quiz
    room.currentQuestionIndex = 0;
    room.sharedTop = [];
    for (const id in room.players) room.players[id].answers = [];
    sendQuestionToAll(roomId); // send first question immediately
  });

  // --- Player submits answer ---
  socket.on("answer", ({ roomId, value }) => {
    const room = rooms[roomId];
    if (!room || room.currentQuestionIndex < 0) return;

    const player = room.players[socket.id];
    if (!player) return;

    const currentQ = quiz[room.currentQuestionIndex];
    player.answers.push({ question: currentQ.text, value });

    // Check if all answered
    const totalPlayers = Object.keys(room.players).length;
    const answeredCount = Object.values(room.players).filter(
      (p) => p.answers.length === room.currentQuestionIndex + 1
    ).length;

    if (answeredCount === totalPlayers) {
      if (room.currentQuestionIndex < quiz.length - 1) {
        room.currentQuestionIndex++;
        sendQuestionToAll(roomId);
      } else {
        sendResultsToAll(roomId);
      }
    }
  });

  // --- Player shares top character ---
  socket.on("shareTop", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    const p = room.players[socket.id];
    if (!p || p.sharedTop) return;

    const characters = calculateCharacters(p);
    const sorted = Object.entries(characters).sort((a, b) => b[1] - a[1]);
    const topCharacter = sorted[0][0];

    p.sharedTop = topCharacter;
    room.sharedTop.push({ name: p.name, img: p.img, topCharacter });

    io.to(roomId).emit("updateShared", room.sharedTop);
  });

  // --- Disconnect ---
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (room.players[socket.id]) delete room.players[socket.id];

      io.to(roomId).emit(
        "updatePlayers",
        Object.values(room.players).map((p) => ({ name: p.name, img: p.img }))
      );
    }
  });
});
