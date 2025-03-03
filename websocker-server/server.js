const WebSocket = require("ws");
const http = require("http");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const server = http.createServer();
const wss = new WebSocket.Server({server});

console.log("🚀 WebSocket Server is starting...");

// Store room connections
const rooms = new Map();

wss.on("connection", (ws, req) => {
    // Extract token from query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    console.log(`🔍 Received WebSocket connection attempt. Token: ${token ? "Present" : "None"}`);

    if (!token) {
        console.log("❌ WebSocket rejected: No token provided");
        ws.close(4001, "Authentication error: No token");
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ws.userId = decoded.user_id;
        console.log(`✅ WebSocket authenticated: User ${ws.userId}`);

        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type === "joinRoom") {
                    const {room_id} = data;
                    if (!room_id) {
                        console.error("❌ Missing room_id in joinRoom event");
                        return;
                    }

                    if (!rooms.has(room_id)) {
                        rooms.set(room_id, new Set());
                    }
                    rooms.get(room_id).add(ws);
                    console.log(`👥 User ${ws.userId} joined room: ${room_id}`);
                }

                if (data.type === "sendMessage") {
                    const {room_id, message} = data;
                    if (!room_id || !message) {
                        console.error("❌ WebSocket Error: Missing room_id or message");
                        return;
                    }

                    console.log(`📩 Storing message: "${message}" from User ${ws.userId}`);

                    try {
                        const response = await axios.post(
                            "http://127.0.0.1:8000/chat/store-message",
                            {
                                room_id: room_id,
                                message: message
                            },
                            {
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                    "Content-Type": "application/json"
                                }
                            }
                        );
                        console.log("✅ Django API Response:", response.data);
                    } catch (apiError) {
                        console.error("❌ Django API Error:", apiError.response?.data || apiError.message);
                        return;
                    }
                    if (rooms.has(room_id)) {
                        rooms.get(room_id).forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({type: "receiveMessage", userId: ws.userId, message}));
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("❌ WebSocket message error:", error.message);
            }
        });

        ws.on("close", () => {
            console.log(`🔴 User ${ws.userId} disconnected.`);
            // Remove user from all rooms
            rooms.forEach((clients, room_id) => {
                clients.delete(ws);
                if (clients.size === 0) {
                    rooms.delete(room_id);
                }
            });
        });

        ws.on("error", (err) => {
            console.error("❌ WebSocket error:", err.message);
        });

    } catch (err) {
        console.log("❌ JWT Authentication failed:", err.message);
        ws.close();
    }
});

// Start WebSocket server
server.listen(8001, "0.0.0.0", () => console.log(`🚀 WebSocket Server running on port 8001`));
