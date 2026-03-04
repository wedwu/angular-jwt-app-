import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ApiService, DashboardStats, ActivityLog } from '@/core/services/api.service';
import { AuthService } from '@/core/services/auth.service';
import { User } from '@/core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats:       DashboardStats | null = null;
  activity:    ActivityLog[]          = [];
  recentUsers: User[]                 = [];
  currentUser: User | null;
  isLoading    = true;
  private destroy$ = new Subject<void>();

  statDefs = [
    { key: 'totalUsers',    label: 'Total Users',    icon: 'group',        color: '#3f51b5', prefix: '',  suffix: '' },
    { key: 'activeUsers',   label: 'Active Users',   icon: 'how_to_reg',   color: '#43a047', prefix: '',  suffix: '' },
    { key: 'totalRevenue',  label: 'Revenue',        icon: 'payments',     color: '#ff6f00', prefix: '$', suffix: '' },
    { key: 'monthlyGrowth', label: 'Monthly Growth', icon: 'trending_up',  color: '#e91e63', prefix: '',  suffix: '%' },
  ];

  constructor(private api: ApiService, private auth: AuthService) {
    this.currentUser = this.auth.currentUser;
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    forkJoin({
      stats:    this.api.getDashboardStats(),
      activity: this.api.getActivityLog(),
      users:    this.api.getUsers(),
    })
    .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
    .subscribe(({ stats, activity, users }) => {
      this.stats       = stats;
      this.activity    = activity.slice(0, 6);
      this.recentUsers = users.slice(0, 5);
    });
  }

  getValue(key: string): number { return (this.stats as any)?.[key] ?? 0; }

  get completionPct(): number {
    if (!this.stats) return 0;
    const total = this.stats.completedTasks + this.stats.pendingTasks;
    return total ? Math.round((this.stats.completedTasks / total) * 100) : 0;
  }

  activityIcon(type: string): string {
    return ({ success: 'check_circle', warning: 'warning', error: 'cancel', info: 'info' } as any)[type] ?? 'info';
  }

  activityColor(type: string): string {
    return ({ success: '#43a047', warning: '#fb8c00', error: '#e53935', info: '#1e88e5' } as any)[type] ?? '#1e88e5';
  }

  timeAgo(ts: string): string {
    const d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (d < 60)    return d + 's ago';
    if (d < 3600)  return Math.floor(d / 60)   + 'm ago';
    if (d < 86400) return Math.floor(d / 3600)  + 'h ago';
    return Math.floor(d / 86400) + 'd ago';
  }

  initials(u: User): string { return (u.firstName[0] ?? '') + (u.lastName[0] ?? ''); }

  roleColor(r: string): string {
    return ({ admin: '#3f51b5', manager: '#ff6f00', user: '#43a047' } as any)[r] ?? '#888';
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
