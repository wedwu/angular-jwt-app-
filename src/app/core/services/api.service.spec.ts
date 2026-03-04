import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let svc:  ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    svc  = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('should be created', () => expect(svc).toBeTruthy());

  it('GET /users returns array', () => {
    svc.getUsers().subscribe(users => expect(Array.isArray(users)).toBeTrue());
    http.expectOne(`${environment.apiUrl}/users`).flush([]);
  });

  it('POST /users sends DTO without password', () => {
    const dto = { username: 'u', email: 'e@e.com', role: 'user' as const,
                  firstName: 'A', lastName: 'B', password: 'secret123' };
    svc.createUser(dto).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body['password']).toBeUndefined();
    expect(req.request.body['username']).toBe('u');
    req.flush({ id: 7, ...dto, isActive: true, createdAt: '2024-01-01' });
  });

  it('PATCH /users/:id sends partial', () => {
    svc.updateUser(1, { isActive: false }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/users/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush({});
  });

  it('DELETE /users/:id', () => {
    svc.deleteUser(3).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/users/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('GET /stats returns stats shape', () => {
    svc.getDashboardStats().subscribe(s => expect(s.totalUsers).toBeDefined());
    http.expectOne(`${environment.apiUrl}/stats`).flush({ totalUsers: 6 });
  });

  it('GET /activity returns activity logs', () => {
    svc.getActivityLog().subscribe(a => expect(Array.isArray(a)).toBeTrue());
    http.expectOne(`${environment.apiUrl}/activity`).flush([]);
  });
});
