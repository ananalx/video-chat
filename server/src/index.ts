import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);

const allowedOrigins = ["http://localhost:5173", "http://192.168.1.38:5173"];

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "dist")));

const users: Record<string, string[]> = {}; // Tracks users in each room
const socketToRoom: Record<string, string> = {}; // Maps socket IDs to room IDs

io.on("connection", (socket: Socket) => {
  socket.on("join room", (roomID: string) => {
    console.log("User join:", roomID);

    if (!users[roomID]) {
      users[roomID] = [];
    }

    if (users[roomID].length >= 4) {
      socket.emit("room full");
      return;
    }

    if (users[roomID].includes(socket.id)) {
      socketToRoom[socket.id] = roomID;
      console.log("users", users);

      const usersInRoom = users[roomID].filter((id) => id !== socket.id);
      socket.emit("all users", usersInRoom);
      return;
    }

    users[roomID].push(socket.id);
    socketToRoom[socket.id] = roomID;
    console.log("users", users);

    const usersInRoom = users[roomID].filter((id) => id !== socket.id);
    socket.emit("all users", usersInRoom);
  });

  socket.on(
    "sending signal",
    (payload: { userToSignal: string; callerID: string; signal: unknown }) => {
      io.to(payload.userToSignal).emit("user joined", {
        signal: payload.signal,
        callerID: payload.callerID,
      });
    }
  );

  socket.on(
    "returning signal",
    (payload: { signal: unknown; callerID: string }) => {
      io.to(payload.callerID).emit("receiving returned signal", {
        signal: payload.signal,
        id: socket.id,
      });
    }
  );

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    if (roomID && users[roomID]) {
      users[roomID] = users[roomID].filter((id) => id !== socket.id);
    }
    delete socketToRoom[socket.id];
    console.log(`User ${socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
