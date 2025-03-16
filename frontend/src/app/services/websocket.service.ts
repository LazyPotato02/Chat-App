import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private socket!: WebSocket;

    connect(token: string): void {
        this.socket = new WebSocket(`ws://127.0.0.1:8001?token=${token}`);

        this.socket.onopen = () => {
            console.log("✅ WebSocket connected!");
        };

        this.socket.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
        };

        this.socket.onclose = () => {
            console.log("🔴 WebSocket disconnected.");
        };
    }

    sendMessage(data: any): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    onMessage(callback: (data: any) => void): void {
        this.socket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            callback(messageData);
        };
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
        }
    }
}
