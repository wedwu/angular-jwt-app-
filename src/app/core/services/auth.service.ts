import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, JwtPayload } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private readonly TK  = environment.tokenKey;
  private readonly RTK = environment.refreshTokenKey;
  private readonly UK  = environment.userKey;

  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$  = this.userSubject.asObservable();
  isLoggedIn$   = this.currentUser$.pipe(map(u => !!u));

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login ──────────────────────────────────────────────────────────────────
  login(creds: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, creds).pipe(
      tap(res => this.persistSession(res)),
      catchError(err => throwError(() => new Error(err.error?.error ?? 'Login failed')))
    );
  }

  // ── Refresh ────────────────────────────────────────────────────────────────
  refreshToken(): Observable<{ accessToken: string }> {
    const rt = localStorage.getItem(this.RTK);
    return this.http
      .post<{ accessToken: string }>(`${this.api}/auth/refresh`, { refreshToken: rt })
      .pipe(tap(res => localStorage.setItem(this.TK, res.accessToken)));
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(this.TK);
    localStorage.removeItem(this.RTK);
    localStorage.removeItem(this.UK);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Token helpers ──────────────────────────────────────────────────────────
  getToken(): string | null { return localStorage.getItem(this.TK); }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const p = this.decode(token);
      return p.exp > Math.floor(Date.now() / 1000);
    } catch { return false; }
  }

  get currentUser(): User | null { return this.userSubject.value; }

  hasRole(...roles: string[]): boolean {
    const role = this.currentUser?.role;
    return !!role && roles.includes(role);
  }

  updateLocalUser(patch: Partial<User>): void {
    const updated = { ...this.userSubject.value!, ...patch };
    localStorage.setItem(this.UK, JSON.stringify(updated));
    this.userSubject.next(updated);
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private persistSession(res: LoginResponse): void {
    localStorage.setItem(this.TK,  res.accessToken);
    localStorage.setItem(this.RTK, res.refreshToken);
    const u: User = {
      id: res.user.id, username: res.user.username,
      email: res.user.email ?? '', role: res.user.role as any,
      firstName: '', lastName: '', isActive: true, createdAt: ''
    };
    localStorage.setItem(this.UK, JSON.stringify(u));
    this.userSubject.next(u);
  }

  private loadUser(): User | null {
    try { return JSON.parse(localStorage.getItem(this.UK) ?? 'null'); }
    catch { return null; }
  }

  private decode(token: string): JwtPayload {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  }
}
