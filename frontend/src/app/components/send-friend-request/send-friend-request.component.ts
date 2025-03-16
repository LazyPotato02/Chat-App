import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import {NgForOf, NgIf} from '@angular/common';

@Component({
    selector: 'app-send-friend-request',
    templateUrl: './send-friend-request.component.html',
    imports: [
        NgIf,
        NgForOf
    ],
    styleUrls: ['./send-friend-request.component.css']
})
export class SendFriendRequestComponent implements OnInit {
    users: { id: number, username: string }[] = [];
    message = '';

    constructor(private chatService: ChatService) {}

    ngOnInit(): void {
        this.chatService.getAllUsers().subscribe({
            next: (data) => this.users = data,
            error: (err) => console.error("Error fetching users:", err)
        });
    }

    sendRequest(receiverId: number): void {
        this.chatService.sendFriendRequest(receiverId).subscribe({
            next: (response) => {
                this.message = `Friend request sent to ${this.users.find(user => user.id === receiverId)?.username}`;
            },
            error: (err) => {
                this.message = err.error?.error || "Failed to send friend request";
            }
        });
    }
}
