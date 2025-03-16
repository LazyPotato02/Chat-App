import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-friends-list',
    templateUrl: './friends-list.component.html'
})
export class FriendsListComponent implements OnInit {
    friends: { id: number, username: string }[] = [];

    constructor(private chatService: ChatService) {}

    ngOnInit(): void {
        this.chatService.getFriends().subscribe({
            next: (data) => this.friends = data,
            error: (err) => console.error("Error fetching friends:", err)
        });
    }

    removeFriend(friendId: number): void {
        this.chatService.removeFriend(friendId).subscribe(() => {
            this.friends = this.friends.filter(friend => friend.id !== friendId);
        });
    }
}
