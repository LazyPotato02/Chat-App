import { Component, OnInit } from '@angular/core';
import { FriendService } from '../../services/friend.service';
import {NgForOf, NgIf} from '@angular/common';

@Component({
    selector: 'app-friend-requests',
    imports: [
        NgIf,
        NgForOf
    ],
    templateUrl: './friend-requests.component.html',
    styleUrls: ['./friend-requests.component.css']
})
export class FriendRequestsComponent implements OnInit {
    pendingRequests: { id: number, sender_id: number, sender_username: string }[] = [];

    constructor(private chatService: FriendService) {}

    ngOnInit(): void {
        this.chatService.getPendingRequests().subscribe({
            next: (data) => this.pendingRequests = data,
            error: (err) => console.error("Error fetching friend requests:", err)
        });
    }

    respondToRequest(requestId: number, response: 'accepted' | 'rejected'): void {
        this.chatService.respondToRequest(requestId, response).subscribe(() => {
            this.pendingRequests = this.pendingRequests.filter(req => req.id !== requestId);
        });
    }
}
