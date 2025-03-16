import { Component, OnInit } from '@angular/core';
import { FriendService } from '../../services/friend.service';
import {NgForOf, NgIf} from '@angular/common';

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

    constructor(private chatService: FriendService) {}

    ngOnInit(): void {
        this.chatService.getFriends().subscribe({
            next: (data) => this.friends = data,
            error: (err) => console.error("Error fetching friends:", err)
        });
    }

    removeFriend(friendId: number, username: string): void {
        const confirmRemove = confirm(`Are you sure you want to remove ${username} from your friends list?`);

        if (confirmRemove) {
            this.chatService.removeFriend(friendId).subscribe(() => {
                this.friends = this.friends.filter(friend => friend.id !== friendId);
            });
        }
    }

}
