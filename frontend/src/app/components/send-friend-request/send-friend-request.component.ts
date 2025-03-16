import { Component } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-send-friend-request',
    imports: [
        FormsModule,
        NgIf
    ],
    templateUrl: './send-friend-request.component.html'
})
export class SendFriendRequestComponent {
    userId = 0;
    message = '';

    constructor(private chatService: ChatService) {}

    sendRequest(): void {
        if (this.userId > 0) {
            this.chatService.sendFriendRequest(this.userId).subscribe({
                next: (response) => this.message = response.message,
                error: (err) => this.message = err.error?.error || "Failed to send friend request"
            });
        }
    }
}
