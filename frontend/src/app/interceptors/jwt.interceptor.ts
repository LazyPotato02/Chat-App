import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const accessToken = authService.getAccessToken();

    let authReq = req;
    if (accessToken) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${accessToken}` }
        });
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error.status === 401 && !req.url.includes('/api/token/refresh/')) {
                return handle401Error(authService, req, next);
            }
            return throwError(() => error);
        })
    );
};

const handle401Error = (authService: AuthService, req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    if (!authService.getRefreshToken()) {
        authService.logout();
        return throwError(() => new Error('Refresh token is missing'));
    }

    return authService.refreshToken().pipe(
        switchMap((newAccessToken) => {
            return next(req.clone({
                setHeaders: { Authorization: `Bearer ${newAccessToken}` }
            }));
        }),
        catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
        })
    );
};
