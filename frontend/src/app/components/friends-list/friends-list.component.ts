import { Component, OnInit } from '@angular/core';
import { FriendService } from '../../services/friend.service';
import {NgForOf, NgIf} from '@angular/common';
import {ChatService} from '../../services/chat.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-friends-list',
    imports: [
        NgIf,
        NgForOf
    ],
    templateUrl: './friends-list.component.html',
    styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit {
    friends: { id: number, username: string }[] = [];

    constructor(
        private chatService: ChatService,
        private friendService: FriendService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.chatService.getFriends().subscribe({
            next: (data) => this.friends = data,
            error: (err) => console.error("Error fetching friends:", err)
        });
    }
    startChat(friendId: number): void {
        this.chatService.startChat(friendId).subscribe({
            next: (room) => {
                this.router.navigate([`/chat/${room.room_id}`]);
            },
            error: (err) => console.error("Error starting chat:", err)
        });
    }
    removeFriend(friendId: number, username: string): void {
        const confirmRemove = confirm(`Are you sure you want to remove ${username} from your friends list?`);

        if (confirmRemove) {
            this.friendService.removeFriend(friendId).subscribe(() => {
                this.friends = this.friends.filter(friend => friend.id !== friendId);
            });
        }
    }

}
