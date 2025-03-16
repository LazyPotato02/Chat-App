import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { WebSocketService } from '../../services/websocket.service';
import { AuthService } from '../../auth/auth.service';
import {NgForOf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-chat-window',
    templateUrl: './chat-window.component.html',
    imports: [
        NgForOf,
        FormsModule
    ],
    styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
    roomId!: number;
    messages: { sender: string; content: string; timestamp: string }[] = [];
    newMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private chatService: ChatService,
        private wsService: WebSocketService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.roomId = Number(this.route.snapshot.paramMap.get('roomId'));

        // 🔹 Fetch previous messages when opening the chat
        this.chatService.getMessages(this.roomId).subscribe({
            next: (data) => this.messages = data,
            error: (err) => console.error("Error fetching messages:", err)
        });

        // 🔹 Connect to WebSocket
        const token = this.authService.getAccessToken();
        if (token) {
            this.wsService.connect(token);

            this.wsService.onMessage((data) => {
                if (data.type === "receiveMessage") {
                    this.messages.push({
                        sender: `User ${data.userId}`,
                        content: data.message,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            this.wsService.sendMessage({ type: "joinRoom", room_id: this.roomId });
        }
    }

    sendMessage(): void {
        if (this.newMessage.trim()) {
            this.wsService.sendMessage({
                type: "sendMessage",
                room_id: this.roomId,
                message: this.newMessage
            });

            this.newMessage = ''; // Clear input field
        }
    }
}
