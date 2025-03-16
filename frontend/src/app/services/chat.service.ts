import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = 'http://127.0.0.1:8000/chat';

    constructor(private http: HttpClient) {}

    getChatRooms(): Observable<{ id: number; name: string }[]> {
        return this.http.get<{ id: number; name: string }[]>(`${this.apiUrl}/rooms`);
    }

    getMessages(roomId: number): Observable<{ sender: string; content: string; timestamp: string }[]> {
        return this.http.get<{ sender: string; content: string; timestamp: string }[]>(`${this.apiUrl}/messages?room_id=${roomId}`);
    }

    sendMessage(roomId: number, content: string): Observable<{ sender: string; content: string; timestamp: string }> {
        return this.http.post<{ sender: string; content: string; timestamp: string }>(
            `${this.apiUrl}/send`,
            { room_id: roomId, content }
        );
    }

}
