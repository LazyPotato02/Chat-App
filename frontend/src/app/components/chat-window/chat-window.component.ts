import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { WebSocketService } from '../../services/websocket.service';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { formatDate, NgForOf } from '@angular/common';

@Component({
    selector: 'app-chat-window',
    templateUrl: './chat-window.component.html',
    imports: [
        FormsModule,
        NgForOf
    ],
    styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
    roomId!: number;
    messages: { sender: string; content: string; timestamp: string }[] = [];
    newMessage: string = '';
    currentUsername: string = '';

    constructor(
        private route: ActivatedRoute,
        private chatService: ChatService,
        private wsService: WebSocketService,
        private authService: AuthService,
        private cdRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.roomId = Number(this.route.snapshot.paramMap.get('roomId'));
        const token = this.authService.getAccessToken();


        const user = localStorage.getItem('user');
        if (user) {
            this.currentUsername = JSON.parse(user).username;
        }

        if (token) {
            this.wsService.connect(token);
            console.log(`🔍 Requesting to join room: ${this.roomId}`);

            setTimeout(() => {
                this.wsService.sendMessage({
                    type: "joinRoom",
                    room_id: this.roomId
                });
            }, 500);


            this.wsService.onMessage((data) => {
                if (!data) {
                    console.error("❌ WebSocket received an empty message.");
                    return;
                }

                if (data.type === "receiveMessage") {
                    console.log("📩 New message received:", data);

                    const senderUsername = data.userId === this.authService.getUser()?.id
                        ? this.currentUsername
                        : `User ${data.userId}`;

                    this.messages.push({
                        sender: senderUsername,
                        content: data.message,
                        timestamp: this.formatTimestamp(new Date(data.timestamp))
                    });

                    this.cdRef.detectChanges();
                }
            });

            // 🔹 Fetch previous messages (already have correct usernames)
            this.chatService.getMessages(this.roomId).subscribe({
                next: (data) => {
                    this.messages = data.map(msg => ({
                        sender: msg.sender,
                        content: msg.content,
                        timestamp: this.formatTimestamp(new Date(msg.timestamp))
                    }));
                },
                error: (err) => console.error("Error fetching messages:", err)
            });
        }
    }


    formatTimestamp(date: Date): string {
        return formatDate(date, 'short', 'en-US'); // Example output: "3/16/25, 7:12 PM"
    }

    sendMessage(): void {
        if (this.newMessage.trim()) {
            this.wsService.sendMessage({
                type: "sendMessage",
                room_id: this.roomId,
                message: this.newMessage
            });

            this.newMessage = '';
        }
    }

    ngOnDestroy(): void {
        this.wsService.disconnect();
    }
}
