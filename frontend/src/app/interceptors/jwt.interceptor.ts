import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import {AuthService} from '../auth/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
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
        return authService.handle401Error(req, next);
      }
      return throwError(() => error);
    })
  );
};
