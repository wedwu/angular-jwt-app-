import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('AuthGuard', () => {
  let guard:   AuthGuard;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard, { provide: AuthService, useValue: spy }],
    });
    guard   = TestBed.inject(AuthGuard);
    authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => expect(guard).toBeTruthy());

  it('allows access when authenticated', () => {
    authSpy.isAuthenticated.and.returnValue(true);
    const result = guard.canActivate(
      new ActivatedRouteSnapshot(),
      { url: '/dashboard' } as RouterStateSnapshot
    );
    expect(result).toBeTrue();
  });

  it('redirects to /login when not authenticated', () => {
    authSpy.isAuthenticated.and.returnValue(false);
    const result = guard.canActivate(
      new ActivatedRouteSnapshot(),
      { url: '/dashboard' } as RouterStateSnapshot
    );
    expect(result).not.toBeTrue();
  });
});
