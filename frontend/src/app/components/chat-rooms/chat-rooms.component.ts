import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {ChatService} from '../../services/chat.service';
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
    chatRooms: { id: number; name: string }[] = [];

    constructor(private chatService: ChatService, private router: Router) {}

    ngOnInit(): void {
        this.chatService.getChatRooms().subscribe({
            next: (rooms) => this.chatRooms = rooms,
            error: (err) => console.error("Error fetching chat rooms:", err)
        });
    }

    enterChat(roomId: number): void {
        this.router.navigate([`/chat/${roomId}`]);
    }
}
