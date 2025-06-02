import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
const server = createServer(app);

const allowedOrigins = ["http://localhost:5173", "http://192.168.1.105:5173"];

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "dist")));
type User = { id: string; name: string };
const users: Record<string, User[]> = {}; // Tracks users in each room
const socketToRoom: Record<string, string> = {}; // Maps socket IDs to room IDs

const io = new Server(server);

io.on("connection", (socket: Socket) => {
  socket.on(
    "join room",
    ({ roomID, name }: { roomID: string; name: string }) => {
      console.log("User join:", roomID, name);

      if (!users[roomID]) {
        users[roomID] = [];
      }

      if (users[roomID].length >= 4) {
        socket.emit("room full");
        return;
      }

      users[roomID].push({ id: socket.id, name });
      socketToRoom[socket.id] = roomID;
      console.log("users", users);

      const usersInRoom = users[roomID].filter((user) => user.id !== socket.id);
      socket.emit("all users", usersInRoom);
    }
  );

  socket.on(
    "sending signal",
    (payload: {
      userToSignal: string;
      callerID: string;
      signal: unknown;
      userName: string;
    }) => {
      io.to(payload.userToSignal).emit("user joined", {
        signal: payload.signal,
        callerID: payload.callerID,
        name: payload.userName,
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

  socket.on("user-disconnect", () => {
    const roomID = socketToRoom[socket.id];
    if (roomID && users[roomID]) {
      users[roomID] = users[roomID].filter((user) => user.id !== socket.id);
    }
    delete socketToRoom[socket.id];
    console.log(`User ${socket.id} disconnected`);
    socket.broadcast.emit("remove-user", socket.id);
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    if (roomID && users[roomID]) {
      users[roomID] = users[roomID].filter((user) => user.id !== socket.id);
    }
    delete socketToRoom[socket.id];
    console.log(`User ${socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
