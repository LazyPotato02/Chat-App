import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError, BehaviorSubject, switchMap, filter, take, catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = 'http://127.0.0.1:8000/api';
    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<string | null>(null);

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }

    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    saveTokens(access: string, refresh: string): void {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
    }

    getUserProfile(): Observable<{ id: number; username: string }> {
        return this.http.get<{ id: number; username: string }>(`${this.apiUrl}/user/profile/`);
    }

    login(username: string, password: string): Observable<{ access: string; refresh: string }> {
        return this.http.post<{ access: string; refresh: string }>(`${this.apiUrl}/token/`, { username, password }).pipe(
            tap(tokens => {
                this.saveTokens(tokens.access, tokens.refresh);
            })
        );
    }
    refreshToken(): Observable<string> {
        return this.http.post<{ access: string }>(`${this.apiUrl}/token/refresh/`, {
            refresh: this.getRefreshToken()
        }).pipe(
            tap(response => {
                this.saveTokens(response.access, this.getRefreshToken()!);
            }),
            switchMap(response => {
                return of(response.access);
            })
        );
    }

    handle401Error(req: any, next: any): Observable<any> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.refreshToken().pipe(
                switchMap((newToken) => {
                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(newToken);
                    return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
                }),
                catchError((err) => {
                    this.isRefreshing = false;
                    this.logout();
                    return throwError(() => err);
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap((token) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token!}` } })))
            );
        }
    }

    register(username: string, password: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/user/register/`, {
            username,
            password
        });
    }
    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    }
}
