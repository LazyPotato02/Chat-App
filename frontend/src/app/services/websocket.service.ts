import { Injectable, NgZone } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private socket!: WebSocket;
    private messageCallback: ((data: any) => void) | null = null;

    constructor(private ngZone: NgZone) {}

    connect(token: string): void {
        console.log("🔌 Connecting to WebSocket...");
        this.socket = new WebSocket(`ws://127.0.0.1:8001?token=${token}`);

        this.socket.onopen = () => {
            console.log("✅ WebSocket connected.");
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // console.log("📩 WebSocket message received:", data);

            if (this.messageCallback !== null) {  // ✅ Ensure callback is set before calling it
                this.ngZone.run(() => {
                    // console.log("🔥 Updating UI with new message...");
                    this.messageCallback!(data);  // ✅ Use "!" to assert that it's not null
                });
            } else {
                console.warn("⚠️ No callback function set for WebSocket messages.");
            }

        };

        this.socket.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
        };

        this.socket.onclose = () => {
            console.log("🔴 WebSocket disconnected.");
        };
    }

    onMessage(callback: (data: any) => void): void {
        this.messageCallback = callback;
    }

    sendMessage(message: any): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            // console.log("🚀 Sending message:", message);
            this.socket.send(JSON.stringify(message));
        } else {
            console.error("❌ Cannot send message, WebSocket not open.");
        }
    }

    disconnect(): void {
        if (this.socket) {
            console.log("🔌 Disconnecting WebSocket...");
            this.socket.close();
        }
    }
}
