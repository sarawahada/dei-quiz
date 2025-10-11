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

// --- Socket.io ---
io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // Host creates room
  socket.on("createRoom", () => {
    const roomId = socket.id;
    rooms[roomId] = { players: {}, currentQuestionIndex: -1, sharedTop: [] };
    socket.join(roomId);
    io.to(socket.id).emit("roomCreated", roomId);
  });

  // Player joins room
  socket.on("join", ({ roomId, name, img }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.players[socket.id] = { name, img, answers: [], sharedTop: null };
    socket.join(roomId);

    io.to(roomId).emit(
      "updatePlayers",
      Object.values(room.players).map((p) => ({ name: p.name, img: p.img }))
    );
  });

  // Host starts quiz
  socket.on("hostStart", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    room.currentQuestionIndex = 0;
    sendQuestionToAll(roomId);
  });

  // Player submits answer
  socket.on("answer", ({ roomId, value }) => {
    const room = rooms[roomId];
    if (!room || room.currentQuestionIndex < 0) return;

    const player = room.players[socket.id];
    const currentQ = quiz[room.currentQuestionIndex];
    if (!player) return;

    player.answers.push({ question: currentQ.text, value });

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

  // Player shares top character
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

    // Send the updated shared list to everyone
    io.to(roomId).emit("updateShared", room.sharedTop);
  });

  // Disconnect
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

// --- Helpers ---
function sendQuestionToAll(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  const total = quiz.length;
  const current = quiz[room.currentQuestionIndex];
  for (const id in room.players) {
    io.to(id).emit("question", {
      text: current.text,
      index: room.currentQuestionIndex + 1,
      total,
    });
  }
}

function calculateCharacters(player) {
  const characters = { Equalizer: 0, Bridgebuilder: 0, Catalyst: 0, "Devil Advocate": 0 };
  player.answers.forEach((a) => {
    const q = quiz.find((qq) => qq.text === a.question);
    for (const type in q.mapping) {
      characters[type] += q.mapping[type] * a.value;
    }
  });
  return characters;
}

function sendResultsToAll(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  const results = {};
  for (const id in room.players) {
    const p = room.players[id];
    const characters = calculateCharacters(p);
    const sorted = Object.entries(characters).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0];
    const secondary = sorted[1];

    let hybrid = null;
    if (["Equalizer", "Catalyst"].every((x) => [primary[0], secondary[0]].includes(x)))
      hybrid = "The Balancer";
    else if (["Bridgebuilder", "Devil Advocate"].every((x) => [primary[0], secondary[0]].includes(x)))
      hybrid = "The Visionary Advocate";
    else if (["Catalyst", "Devil Advocate"].every((x) => [primary[0], secondary[0]].includes(x)))
      hybrid = "The Firestarter";
    else if (["Equalizer", "Bridgebuilder"].every((x) => [primary[0], secondary[0]].includes(x)))
      hybrid = "The Reformer";

    results[id] = { characters, topTwo: [primary, secondary], hybrid };
  }

  for (const id in results) io.to(id).emit("showResults", results[id]);
  io.to(roomId).emit("allResults", results);
}

// --- Start server ---
const PORT = process.env.PORT || 2011;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
