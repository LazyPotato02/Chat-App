import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {catchError, map, Observable, of, switchMap, throwError} from 'rxjs';
import { tap } from 'rxjs/operators';

// Define token structure
interface AuthTokens {
    access: string;
    refresh: string;
}

// Define user structure
interface User {
    id: number;
    username: string;
    email: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://127.0.0.1:8000';

    constructor(private http: HttpClient) {}
    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }
    private saveAuthData(tokens: AuthTokens, user: User): void {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(user));
    }

    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    getUser(): User | null {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }
    getCurrentUser(): Observable<{ id: number; username: string; email: string }> {
        return this.http.get<{ id: number; username: string; email: string }>(`${this.apiUrl}/user/me/`);
    }
    login(username: string, password: string): Observable<{ access: string; refresh: string }> {
        return this.http.post<{ access: string; refresh: string }>(`${this.apiUrl}/api/token`, { username, password });
    }

    register(username: string, email: string, password: string): Observable<{ access: string; refresh: string; user: User }> {
        return this.http.post<{ access: string; refresh: string; user: User }>(
            `${this.apiUrl}/user/register`,
            { username, email, password },
            { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
        );
    }

    refreshToken(): Observable<string> {
        const refresh = this.getRefreshToken();
        if (!refresh) return throwError(() => new Error('No refresh token available'));

        return this.http.post<{ access: string }>(`${this.apiUrl}/api/token/refresh/`, { refresh }).pipe(
            switchMap(response => {
                const user = this.getUser(); // Get stored user data
                if (!user) {
                    return throwError(() => new Error('No user data available'));
                }

                this.saveAuthData({ access: response.access, refresh }, user);

                return of(response.access);
            }),
            catchError((error) => {
                this.logout();
                return throwError(() => error);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
}
