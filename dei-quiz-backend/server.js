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

// Room structure: { roomId: { players: {}, currentQuestionIndex, sharedTop: [], answered: Set } }
let rooms = {};
let timers = {};

// Health check endpoint for Render.com
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(express.static(path.join(__dirname, "../dei-quiz-frontend/dist")));

// Catch-all handler for SPA routing - must be last
// Use a more compatible approach for newer Express versions
app.use((req, res, next) => {
  // Skip API routes and health check
  if (req.path.startsWith('/api') || req.path === '/health') {
    return res.status(404).json({ error: 'Not found' });
  }
  // Serve the React app for all other routes
  res.sendFile(path.join(__dirname, "../dei-quiz-frontend/dist/index.html"));
});

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // --- Host creates room ---
  socket.on("createRoom", () => {
    const roomId = socket.id;
    rooms[roomId] = {
      players: {},
      currentQuestionIndex: -1,
      sharedTop: [],
      answered: new Set(),
    };
    socket.join(roomId);
    io.to(socket.id).emit("roomCreated", roomId);
  });

  // --- Player joins room ---
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

  // --- Host starts quiz ---
  socket.on("hostStart", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    room.currentQuestionIndex = 0;
    sendQuestionToAll(roomId);
  });

  // --- Player answers a question ---
  socket.on("answer", ({ roomId, value }) => {
    const room = rooms[roomId];
    if (!room || room.currentQuestionIndex < 0) return;
    const player = room.players[socket.id];
    const currentQ = quiz[room.currentQuestionIndex];
    if (!player) return;

    // Record answer once per question
    if (room.answered.has(socket.id)) return;
    player.answers.push({ question: currentQ.text, value });
    room.answered.add(socket.id);

    const totalPlayers = Object.keys(room.players).length;
    const answeredCount = room.answered.size;

    // Everyone answered → advance immediately
    if (answeredCount === totalPlayers) {
      if (timers[roomId]) clearTimeout(timers[roomId]);
      nextQuestionOrResults(roomId);
    }
  });

  // --- Player shares top character ---
  socket.on("shareTop", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    const player = room.players[socket.id];
    if (!player || player.sharedTop) return;

    const characters = calculateCharacters(player);
    const sorted = Object.entries(characters).sort((a, b) => b[1] - a[1]);
    const topCharacter = sorted[0][0];

    player.sharedTop = topCharacter;
    room.sharedTop.push({ name: player.name, img: player.img, topCharacter });

    io.to(roomId).emit("updateShared", room.sharedTop);
  });

  // --- Disconnect cleanup ---
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

  // Reset answered players for this round
  room.answered = new Set();

  // Clear any old timer
  if (timers[roomId]) clearTimeout(timers[roomId]);

  const total = quiz.length;
  const current = quiz[room.currentQuestionIndex];
  if (!current) {
    sendResultsToAll(roomId);
    return;
  }

  // Broadcast question to all players
  for (const id in room.players) {
    io.to(id).emit("question", {
      text: current.text,
      index: room.currentQuestionIndex + 1,
      total,
    });
  }

  // 13-second countdown then move automatically
  timers[roomId] = setTimeout(() => nextQuestionOrResults(roomId), 13000);
}

function nextQuestionOrResults(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  room.currentQuestionIndex++;
  if (room.currentQuestionIndex < quiz.length) {
    sendQuestionToAll(roomId);
  } else {
    sendResultsToAll(roomId);
  }
}

function calculateCharacters(player) {
  const characters = {
    Equalizer: 0,
    Bridgebuilder: 0,
    Catalyst: 0,
    "Devil Advocate": 0,
  };
  
  player.answers.forEach((a) => {
    const q = quiz.find((qq) => qq.text === a.question);
    if (!q) return;
    
    // Convert answer value (1-4) to multiplier (-1.5 to +1.5)
    // 1 = Strongly Disagree (-1.5), 2 = Disagree (-0.5), 3 = Agree (+0.5), 4 = Strongly Agree (+1.5)
    const multiplier = (a.value - 2.5) / 1.5; // This converts 1-4 to -1 to +1 range
    
    for (const type in q.mapping) {
      characters[type] += q.mapping[type] * multiplier;
    }
  });
  
  // Ensure all values are positive for display
  const minValue = Math.min(...Object.values(characters));
  if (minValue < 0) {
    for (const type in characters) {
      characters[type] -= minValue;
    }
  }
  
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
    else if (
      ["Bridgebuilder", "Devil Advocate"].every((x) =>
        [primary[0], secondary[0]].includes(x)
      )
    )
      hybrid = "The Visionary Advocate";
    else if (
      ["Catalyst", "Devil Advocate"].every((x) =>
        [primary[0], secondary[0]].includes(x)
      )
    )
      hybrid = "The Firestarter";
    else if (
      ["Equalizer", "Bridgebuilder"].every((x) =>
        [primary[0], secondary[0]].includes(x)
      )
    )
      hybrid = "The Reformer";

    results[id] = { characters, topTwo: [primary, secondary], hybrid };
  }

  for (const id in results) io.to(id).emit("showResults", results[id]);
  io.to(roomId).emit("allResults", results);
}

// --- Start server ---
const PORT = process.env.PORT || 2011;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
