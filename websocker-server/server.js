const WebSocket = require("ws");
const http = require("http");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const rooms = new Map(); // Store active room connections

wss.on("connection", (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
        ws.close(4001, "Authentication error: No token");
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ws.userId = decoded.user_id;
        console.log(`✅ WebSocket authenticated: User ${ws.userId} connected`);

        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type === "joinRoom") {
                    const { room_id } = data;

                    if (!room_id) {
                        console.warn(`⚠️ Invalid joinRoom request from User ${ws.userId}`);
                        return;
                    }

                    if (!rooms.has(room_id)) {
                        rooms.set(room_id, new Set());
                    }

                    rooms.get(room_id).add(ws);

                    console.log(`👥 User ${ws.userId} joined room ${room_id}`);
                    console.log(`🔍 Users currently in room ${room_id}: ${rooms.get(room_id).size}`);

                    // 🚨 Send a confirmation message back to the user
                    ws.send(JSON.stringify({
                        type: "joinedRoom",
                        room_id: room_id,
                        userId: ws.userId
                    }));
                }



                if (data.type === "sendMessage") {
                    const { room_id, message } = data;

                    console.log(`📩 Received message from User ${ws.userId}: ${message}`);

                    try {
                        // Save message in Django
                        const response = await axios.post(
                            "http://127.0.0.1:8000/chat/store-message",
                            { room_id, message },
                            {
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                    "Content-Type": "application/json"
                                }
                            }
                        );

                        const storedMessage = response.data;
                        console.log(`✅ Message stored:`, storedMessage);

                        // 🔹 Ensure the stored message has user & timestamp
                        const broadcastMessage = {
                            type: "receiveMessage",
                            userId: ws.userId,
                            message: message,
                            timestamp: new Date().toISOString()
                        };

                        if (rooms.has(room_id) && rooms.get(room_id).size > 0) {
                            console.log(`📤 Broadcasting message to room ${room_id}`);
                            rooms.get(room_id).forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify(broadcastMessage));
                                }
                            });
                        } else {
                            console.log(`⚠️ No users in room ${room_id}, message not broadcasted.`);
                        }

                    } catch (apiError) {
                        console.error("❌ Django API Error:", apiError.response?.data || apiError.message);
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

    } catch (err) {
        console.error("❌ JWT Authentication failed:", err.message);
        ws.close();
    }
});

server.listen(8001, "0.0.0.0", () => console.log(`🚀 WebSocket Server running on port 8001`));
