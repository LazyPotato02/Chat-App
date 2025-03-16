import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import {RouterLink} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';

@Component({
    selector: 'app-chat-rooms',
    imports: [
        RouterLink,
        NgForOf,
        NgIf
    ],
    templateUrl: './chat-rooms.component.html'
})
export class ChatRoomsComponent implements OnInit {
    chatRooms: { id: number, name: string }[] = [];

    constructor(private chatService: ChatService) {}

    ngOnInit(): void {
        this.chatService.getUserChatRooms().subscribe({
            next: (data) => this.chatRooms = data,
            error: (err) => console.error("Error fetching chat rooms:", err)
        });
    }
}
