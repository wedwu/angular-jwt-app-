import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ApiService } from '@/core/services/api.service';
import { AuthService } from '@/core/services/auth.service';
import { User, UserRole } from '@/core/models/user.model';
import { ConfirmDialogComponent } from '@/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!:      MatSort;

  columns    = ['avatar', 'name', 'email', 'role', 'status', 'joined', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  isLoading  = true;
  showForm   = false;
  createForm!: FormGroup;
  roles: UserRole[] = ['admin', 'manager', 'user'];

  /*
   *
   * This creates a private RxJS Subject that emits no value (just a signal) and is used as a "kill switch" — when destroy$.next() is called (typically in
   * ngOnDestroy), any observable piped through takeUntil(this.destroy$) will automatically unsubscribe, preventing memory leaks when the component is destroyed.
   *
   */

  private destroy$ = new Subject<void>();

  get isAdmin()   { return this.auth.hasRole('admin'); }
  get isManager() { return this.auth.hasRole('admin', 'manager'); }

  constructor(
    private api:    ApiService,
    private auth:   AuthService,
    private fb:     FormBuilder,
    private dialog: MatDialog,
    private snack:  MatSnackBar
  ) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
      username:  ['', [Validators.required, Validators.minLength(3)]],
      email:     ['', [Validators.required, Validators.email]],
      role:      ['user', Validators.required],
      password:  ['', [Validators.required, Validators.minLength(8)]],
    });
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
    this.dataSource.filterPredicate = (u, f) => {
      const s = f.toLowerCase();
      return [u.firstName, u.lastName, u.email, u.username, u.role].some(v => v.toLowerCase().includes(s));
    };
  }

  /*
   *
   * This function calls the API to fetch all users, then pipes the result through two RxJS operators: takeUntil cancels the subscription when the component 
   * is destroyed (preventing memory leaks), and finalize sets isLoading to false once the observable completes regardless of success or failure. On success, 
   * the returned users are assigned to the table's data source; on error, a toast notification is shown.
   *
   */

  loadUsers(): void {
    this.isLoading = true;
    this.api.getUsers()
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({ next: u => (this.dataSource.data = u), error: () => this.toast('Failed to load users', true) });
  }

  applyFilter(e: Event): void {
    this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  toggleStatus(u: User): void {
    this.api.updateUser(u.id, { isActive: !u.isActive }).pipe(takeUntil(this.destroy$)).subscribe({
      next: updated => { u.isActive = updated.isActive; this.toast(u.isActive ? 'Activated' : 'Deactivated'); },
      error: () => this.toast('Update failed', true),
    });
  }

  deleteUser(u: User): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete User', message: `Delete ${u.username}? This cannot be undone.`, confirm: 'Delete' },
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.api.deleteUser(u.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.dataSource.data = this.dataSource.data.filter(x => x.id !== u.id); this.toast('Deleted'); },
        error: () => this.toast('Delete failed', true),
      });
    });
  }

  submitCreate(): void {
    if (this.createForm.invalid) return;
    this.api.createUser(this.createForm.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: u => { this.dataSource.data = [...this.dataSource.data, u]; this.createForm.reset({ role: 'user' }); this.showForm = false; this.toast('User created!'); },
      error: () => this.toast('Create failed', true),
    });
  }

  initials(u: User): string { return (u.firstName[0] ?? '') + (u.lastName[0] ?? ''); }
  roleColor(r: string): string { return ({ admin:'#3f51b5', manager:'#ff6f00', user:'#43a047' } as any)[r] ?? '#888'; }
  private toast(msg: string, error = false): void {
    this.snack.open(msg, 'Close', { duration: 3000, panelClass: [error ? 'error-snack' : 'success-snack'] });
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
