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
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
        ws.close(4001, "Authentication error: No token");
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ws.userId = decoded.user_id;

        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type === "createRoom") {
                    const { room_name } = data;
                    if (!room_name) {
                        console.error("❌ Missing room_name in createRoom event");
                        return;
                    }

                    console.log(`📌 Creating room: ${room_name}`);
                    const response = await axios.post(
                        "http://127.0.0.1:8000/chat/create-room",
                        { name: room_name },
                        { headers: { "Authorization": `Bearer ${token}` } }
                    );

                    console.log("✅ Chat room created:", response.data);
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: "newRoom", room: response.data.room }));
                        }
                    });
                }
            } catch (error) {
                console.error("❌ WebSocket message error:", error.message);
            }
        });

    } catch (err) {
        ws.close();
    }
});


// Start WebSocket server
server.listen(8001, "0.0.0.0", () => console.log(`🚀 WebSocket Server running on port 8001`));
