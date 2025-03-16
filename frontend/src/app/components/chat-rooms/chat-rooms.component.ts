import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';

@Component({
    selector: 'app-chat-rooms',
    templateUrl: './chat-rooms.component.html',
    imports: [
        NgIf,
        NgForOf
    ],
    styleUrls: ['./chat-rooms.component.css']
})
export class ChatRoomsComponent implements OnInit {
    chatRooms: { id: number, name: string }[] = [];

    constructor(private chatService: ChatService, private router: Router) {}

    ngOnInit(): void {
        this.chatService.getChatRooms().subscribe({
            next: (data) => this.chatRooms = data,
            error: (err) => console.error("Error fetching chat rooms:", err)
        });
    }

    openChat(roomId: number): void {
        this.router.navigate([`/chat/${roomId}`]); // ✅ Navigate to chat window
    }
}
