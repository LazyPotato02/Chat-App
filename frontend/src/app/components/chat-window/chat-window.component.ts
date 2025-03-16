import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FriendService } from '../../services/friend.service';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import {ChatService} from '../../services/chat.service';

@Component({
    selector: 'app-chat-window',
    templateUrl: './chat-window.component.html',
    imports: [
        FormsModule,
        NgForOf
    ],
    styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
    roomId!: number;
    messages: { sender: string; content: string; timestamp: string }[] = [];
    newMessage: string = '';

    constructor(private chatService: ChatService, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.roomId = Number(this.route.snapshot.paramMap.get('roomId'));

        this.chatService.getMessages(this.roomId).subscribe({
            next: (msgs) => {
                this.messages = msgs.map(msg => ({
                    sender: msg.sender,
                    content: msg.content,
                    timestamp: msg.timestamp
                }));
            },
            error: (err) => console.error("Error fetching messages:", err)
        });
    }

    sendMessage(): void {
        if (this.newMessage.trim()) {
            this.chatService.sendMessage(this.roomId, this.newMessage).subscribe({
                next: (msg) => {
                    this.messages.push(msg); // Add the new message to the chat window
                    this.newMessage = ''; // Clear input field
                },
                error: (err) => console.error("Error sending message:", err)
            });
        }
    }
}
