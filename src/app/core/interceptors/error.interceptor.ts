import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private refreshing  = false;
  private refreshSubj = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !req.url.includes('/auth/')) {
          return this.handle401(req, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.refreshing) {
      return this.refreshSubj.pipe(
        filter(t => t !== null),
        take(1),
        switchMap(t => next.handle(this.addToken(req, t!)))
      );
    }

    this.refreshing = true;
    this.refreshSubj.next(null);

    return this.auth.refreshToken().pipe(
      switchMap(({ accessToken }) => {
        this.refreshing = false;
        this.refreshSubj.next(accessToken);
        return next.handle(this.addToken(req, accessToken));
      }),
      catchError(err => {
        this.refreshing = false;
        this.auth.logout();
        return throwError(() => err);
      })
    );
  }

  private addToken(req: HttpRequest<unknown>, token: string) {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}
