const WebSocket = require("ws");
const http = require("http");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const server = http.createServer();
const wss = new WebSocket.Server({ server });

console.log("🚀 WebSocket Server is starting...");

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

        ws.on("message", (message) => {
            console.log(`📩 Message received: ${message}`);
        });

        ws.on("close", (code, reason) => {
            console.log(`🔴 WebSocket disconnected. Code: ${code}, Reason: ${reason}`);
        });

    } catch (err) {
        console.log("❌ JWT Authentication failed:", err.message);
        ws.close(4002, "Authentication error: Invalid token");
    }
});

// Start WebSocket server
server.listen(8001, "0.0.0.0", () => console.log(`🚀 WebSocket Server running on port 8001`));
