import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import {NgForOf, NgIf} from '@angular/common';

@Component({
    selector: 'app-friends-list',
    imports: [
        NgIf,
        NgForOf
    ],
    templateUrl: './friends-list.component.html'
})
export class FriendsListComponent implements OnInit {
    friends: { id: number, username: string }[] = [];

    constructor(private chatService: ChatService) {}

    ngOnInit(): void {
        this.chatService.getFriends().subscribe({
            next: (data) => {
                this.friends = data;
            },
            error: (err) => {
                console.error("Error fetching friends:", err);
            }
        });
    }
}
