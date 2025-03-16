import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FriendService {
    private http = inject(HttpClient);
    private apiUrl = 'http://127.0.0.1:8000';

    getFriends(): Observable<{ id: number, username: string }[]> {
        return this.http.get<{ id: number, username: string }[]>(`${this.apiUrl}/friend/`);
    }
    getAllUsers(): Observable<{ id: number, username: string }[]> {
        return this.http.get<{ id: number, username: string }[]>(`${this.apiUrl}/user/list/`);
    }
    getPendingRequests(): Observable<{ id: number, sender_id: number, sender_username: string }[]> {
        return this.http.get<{
            id: number,
            sender_id: number,
            sender_username: string
        }[]>(`${this.apiUrl}/friend/requests`);
    }

    sendFriendRequest(receiverId: number): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/friend/request`, {receiver_id: receiverId});
    }

    respondToRequest(requestId: number, response: 'accepted' | 'rejected'): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/friend/respond`, {
            request_id: requestId,
            response
        });
    }

    cancelFriendRequest(requestId: number): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/friend/cancel`, {
            request_id: requestId
        });
    }

    removeFriend(friendId: number): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/friend/remove`, {friend_id: friendId});
    }

    storeMessage(roomId: number, message: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/chat/store-message`, {
            room_id: roomId,
            message
        });
    }



    getMessages(roomId: number): Observable<{ user: number, content: string, timestamp: string }[]> {
        return this.http.get<{
            user: number,
            content: string,
            timestamp: string
        }[]>(`${this.apiUrl}/chat/messages?room_id=${roomId}`);
    }

    getUserChatRooms(): Observable<{ id: number, name: string }[]> {
        return this.http.get<{ id: number, name: string }[]>(`${this.apiUrl}/chat/rooms`);
    }

    leaveChatRoom(roomId: number): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/chat/leave`, {
            room_id: roomId
        });
    }

}
