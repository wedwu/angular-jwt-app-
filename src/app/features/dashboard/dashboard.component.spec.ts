import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MaterialModule } from '../../shared/material.module';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ActivityFeedComponent } from '../../shared/components/activity-feed/activity-feed.component';

const mockStats = {
  totalUsers: 6, activeUsers: 5, totalRevenue: 48250,
  monthlyGrowth: 12.5, pendingTasks: 8, completedTasks: 42, newUsersThisMonth: 3
};

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('ApiService', ['getDashboardStats','getActivityLog','getUsers']);
    apiSpy.getDashboardStats.and.returnValue(of(mockStats));
    apiSpy.getActivityLog.and.returnValue(of([]));
    apiSpy.getUsers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent, StatCardComponent, ActivityFeedComponent],
      imports: [RouterTestingModule, BrowserAnimationsModule, MaterialModule],
      providers: [
        { provide: ApiService,  useValue: apiSpy },
        { provide: AuthService, useValue: { currentUser: { firstName: 'Admin', lastName: 'User' } } },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());
  it('loads via forkJoin on init', () => expect(apiSpy.getDashboardStats).toHaveBeenCalled());
  it('calculates completionPct correctly', () => expect(component.completionPct).toBe(84));
  it('activityIcon success -> check_circle', () => expect(component.activityIcon('success')).toBe('check_circle'));
  it('activityColor error -> red', () => expect(component.activityColor('error')).toBe('#e53935'));
  it('initials built from first+last', () => {
    const u: any = { firstName: 'Jane', lastName: 'Smith' };
    expect(component.initials(u)).toBe('JS');
  });
});
