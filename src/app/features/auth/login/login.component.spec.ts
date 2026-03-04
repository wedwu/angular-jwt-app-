import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { MaterialModule } from '../../../shared/material.module';

describe('LoginComponent', () => {
  let fixture:   ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authSpy:   jasmine.SpyObj<AuthService>;
  let apiSpy:    jasmine.SpyObj<ApiService>;

  const mockUser = { id: 1, username: 'admin', email: 'a@a.com',
    role: 'admin' as const, firstName: 'Admin', lastName: 'User', isActive: true, createdAt: '2023-01-01' };

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated', 'updateLocalUser']);
    apiSpy  = jasmine.createSpyObj('ApiService',  ['getUserById']);
    authSpy.isAuthenticated.and.returnValue(false);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, BrowserAnimationsModule, MaterialModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ApiService,  useValue: apiSpy  },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('form is invalid when empty', () => expect(component.form.invalid).toBeTrue());

  it('form is valid with correct values', () => {
    component.form.setValue({ username: 'admin', password: 'admin123' });
    expect(component.form.valid).toBeTrue();
  });

  it('fillDemo patches form values', () => {
    component.fillDemo({ username: 'admin', password: 'admin123' });
    expect(component.u.value).toBe('admin');
    expect(component.p.value).toBe('admin123');
  });

  it('calls auth.login on submit', () => {
    authSpy.login.and.returnValue(of({ accessToken: 't', refreshToken: 'r',
      user: { id: 1, username: 'admin', role: 'admin' } }));
    apiSpy.getUserById.and.returnValue(of(mockUser));
    component.form.setValue({ username: 'admin', password: 'admin123' });
    component.onSubmit();
    expect(authSpy.login).toHaveBeenCalledWith({ username: 'admin', password: 'admin123' });
  });

  it('shows error message on failed login', () => {
    authSpy.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
    component.form.setValue({ username: 'x', password: 'wrongpass' });
    component.onSubmit();
    expect(component.error).toContain('Invalid');
  });

  it('u getter returns username control', () => {
    expect(component.u).toBeTruthy();
  });

  it('p getter returns password control', () => {
    expect(component.p).toBeTruthy();
  });
});
