import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import quiz from "./quiz.js"; // your quiz array of questions

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.static(path.join(__dirname, "../dei-quiz-frontend/dist")));

const PORT = process.env.PORT || 3001;

// Store all active rooms
const rooms = {};

// Utility: Generate random 5-digit room code
function generateRoomCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// ---- SOCKET LOGIC ----
io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  // Host creates room
  socket.on("createRoom", () => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      host: socket.id,
      players: {},
      currentQuestion: 0,
      questionStartTime: null,
      timer: null,
    };
    socket.join(roomCode);
    socket.emit("roomCreated", roomCode);
    console.log(`🏠 Room ${roomCode} created by host ${socket.id}`);
  });

  // Player joins room
  socket.on("joinRoom", ({ playerName, roomCode }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit("roomNotFound");
      return;
    }

    room.players[socket.id] = {
      id: socket.id,
      name: playerName,
      score: 0,
      answered: false,
      answerTime: null,
    };

    socket.join(roomCode);
    console.log(`👤 Player ${playerName} joined room ${roomCode}`);

    io.to(roomCode).emit("playersUpdate", Object.values(room.players));
  });

  // Host starts the game
  socket.on("startGame", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    room.currentQuestion = 0;
    sendQuestion(roomCode);
  });

  // Player answers question
  socket.on("playerAnswer", ({ roomCode, answerIndex }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players[socket.id];
    if (!player || player.answered) return; // ignore duplicate answers

    player.answered = true;
    const question = quiz[room.currentQuestion];
    const correctIndex = question.correct;

    const timeTaken = (Date.now() - room.questionStartTime) / 1000;

    // Score based on correctness and speed
    if (answerIndex === correctIndex) {
      if (timeTaken <= 3) player.score += 1000;
      else if (timeTaken <= 6) player.score += 800;
      else if (timeTaken <= 10) player.score += 600;
      else player.score += 400;
    }

    player.answerTime = timeTaken;

    // Notify host about updates
    io.to(room.host).emit("playersUpdate", Object.values(room.players));

    // If all players have answered before timer ends → next question
    const allAnswered = Object.values(room.players).every((p) => p.answered);
    if (allAnswered) {
      clearTimeout(room.timer);
      setTimeout(() => sendNextQuestion(roomCode), 2000);
    }
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    for (const roomCode in rooms) {
      const room = rooms[roomCode];

      if (room.host === socket.id) {
        io.to(roomCode).emit("hostLeft");
        delete rooms[roomCode];
        console.log(`Room ${roomCode} deleted (host left)`);
        return;
      }

      if (room.players[socket.id]) {
        delete room.players[socket.id];
        io.to(roomCode).emit("playersUpdate", Object.values(room.players));
      }
    }
  });
});

// ---- QUESTION MANAGEMENT ----
function sendQuestion(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const question = quiz[room.currentQuestion];
  if (!question) {
    endGame(roomCode);
    return;
  }

  // Reset player answers
  for (const player of Object.values(room.players)) {
    player.answered = false;
    player.answerTime = null;
  }

  room.questionStartTime = Date.now();
  io.to(roomCode).emit("newQuestion", {
    question: question.text,
    options: question.options,
    questionNumber: room.currentQuestion + 1,
    totalQuestions: quiz.length,
  });

  // Start timer (13s)
  clearTimeout(room.timer);
  room.timer = setTimeout(() => sendNextQuestion(roomCode), 13000);
}

function sendNextQuestion(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  room.currentQuestion++;
  if (room.currentQuestion >= quiz.length) {
    endGame(roomCode);
  } else {
    sendQuestion(roomCode);
  }
}

// ---- END GAME ----
function endGame(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const players = Object.values(room.players);
  players.sort((a, b) => b.score - a.score);

  io.to(roomCode).emit("gameOver", players);
  console.log(`🏁 Game ended in room ${roomCode}`);
}

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
