const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]

});

console.log("🚀 WebSocket Server is starting...");

io.on("connection", (socket) => {
    console.log(`✅ WebSocket connected: ${socket.id}`);

    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`👥 User joined room: ${room}`);
    });

    socket.on("sendMessage", ({ room, username, message }) => {
        console.log(`📩 Message from ${username}: ${message} (Room: ${room})`);
        io.to(room).emit("receiveMessage", { username, message });
    });

    socket.on("disconnect", () => {
        console.log("🔴 WebSocket disconnected");
    });

    socket.on("error", (err) => {
        console.error("❌ WebSocket error:", err.message);
    });
});

// 🔹 Listen on 0.0.0.0 instead of 127.0.0.1 to accept external connections
server.listen(8001, "0.0.0.0", () => console.log("🚀 WebSocket Server running on port 8001"));
