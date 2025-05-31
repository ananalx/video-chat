"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
const allowedOrigins = ["http://localhost:5173", "http://192.168.1.38:5173"];
const corsOptions = {
    origin: allowedOrigins,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, "dist")));
const users = {}; // Tracks users in each room
const socketToRoom = {}; // Maps socket IDs to room IDs
io.on("connection", (socket) => {
    socket.on("join room", (roomID) => {
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
    socket.on("sending signal", (payload) => {
        io.to(payload.userToSignal).emit("user joined", {
            signal: payload.signal,
            callerID: payload.callerID,
        });
    });
    socket.on("returning signal", (payload) => {
        io.to(payload.callerID).emit("receiving returned signal", {
            signal: payload.signal,
            id: socket.id,
        });
    });
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
    res.sendFile(path_1.default.join(__dirname, "dist", "index.html"));
});
