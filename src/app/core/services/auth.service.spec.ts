import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let svc:  AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });
    svc  = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => { http.verify(); localStorage.clear(); });

  it('should be created', () => expect(svc).toBeTruthy());

  it('should POST to /auth/login on login()', () => {
    svc.login({ username: 'admin', password: 'admin123' }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: 'h.p.s', refreshToken: 'r.t',
                user: { id: 1, username: 'admin', role: 'admin' } });
  });

  it('should store tokens after successful login', () => {
    svc.login({ username: 'admin', password: 'admin123' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({
      accessToken: 'tok.ey.jwt', refreshToken: 'ref.token',
      user: { id: 1, username: 'admin', role: 'admin' }
    });
    expect(localStorage.getItem(environment.tokenKey)).toBe('tok.ey.jwt');
    expect(localStorage.getItem(environment.refreshTokenKey)).toBe('ref.token');
  });

  it('should clear storage on logout', () => {
    localStorage.setItem(environment.tokenKey, 'tok');
    svc.logout();
    expect(localStorage.getItem(environment.tokenKey)).toBeNull();
  });

  it('should return false for isAuthenticated when no token', () => {
    expect(svc.isAuthenticated()).toBeFalse();
  });

  it('should emit currentUser$ after login', (done) => {
    let emitted = 0;
    svc.currentUser$.subscribe(u => {
      if (++emitted === 2) { // skip initial null
        expect(u?.username).toBe('admin');
        done();
      }
    });
    svc.login({ username: 'admin', password: 'admin123' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({
      accessToken: 'h.p.s', refreshToken: 'r',
      user: { id: 1, username: 'admin', role: 'admin' }
    });
  });

  it('should hasRole return true for matching role', (done) => {
    svc.login({ username: 'admin', password: 'admin123' }).subscribe(() => {
      svc.updateLocalUser({ role: 'admin' });
      expect(svc.hasRole('admin')).toBeTrue();
      expect(svc.hasRole('user')).toBeFalse();
      done();
    });
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({
      accessToken: 'h.p.s', refreshToken: 'r',
      user: { id: 1, username: 'admin', role: 'admin' }
    });
  });
});
