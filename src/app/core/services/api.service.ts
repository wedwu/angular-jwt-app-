import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

export interface DashboardStats {
  id?: number;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  pendingTasks: number;
  completedTasks: number;
  newUsersThisMonth: number;
}

export interface ActivityLog {
  id: number;
  action: string;
  user: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Users ──────────────────────────────────────────────────────────────────
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/users/${id}`);
  }

  createUser(dto: CreateUserDto): Observable<User> {
    const { password, ...rest } = dto;
    return this.http.post<User>(`${this.base}/users`, {
      ...rest,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
    });
  }

  updateUser(id: number, dto: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.base}/users/${id}`, dto);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/stats`);
  }

  getActivityLog(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.base}/activity`);
  }
}
