import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private http = inject(HttpClient);
    private apiUrl = 'http://127.0.0.1:8000/chat';

    getFriends(): Observable<{ id: number, username: string }[]> {
        return this.http.get<{ id: number, username: string }[]>(`${this.apiUrl}/friend/list/`);
    }
}
