import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '@/core/services/auth.service';
import { ApiService } from '@/core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  form!:       FormGroup;
  isLoading    = false;
  hidePassword = true;
  error        = '';
  returnUrl    = '/dashboard';
  private destroy$ = new Subject<void>();

  readonly demos = [
    { label: 'Admin',   icon: 'admin_panel_settings', username: 'admin',      password: 'admin123'    },
    { label: 'Manager', icon: 'manage_accounts',       username: 'jane.smith', password: 'manager123'  },
    { label: 'User',    icon: 'person',                username: 'john.doe',   password: 'password123' },
  ];

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private api:    ApiService,
    private router: Router,
    private route:  ActivatedRoute,
    private snack:  MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) { this.router.navigate(['/dashboard']); return; }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.error = '';
    const { username, password } = this.form.value;

    this.auth.login({ username, password })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: res => {
          this.api.getUserById(res.user.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
              this.auth.updateLocalUser(user);
              this.snack.open(`Welcome back, ${user.firstName || username}!`, '', {
                duration: 2500, panelClass: ['success-snack'],
              });
              this.router.navigate([this.returnUrl]);
            });
        },
        error: err => { this.error = err.message; },
      });
  }

  fillDemo(d: { username: string; password: string }): void {
    this.form.patchValue(d);
  }

  /*
   *
   * The ! is a TypeScript non-null assertion operator, telling the compiler to trust that form.get('username') 
   * will never return null or undefined, even though the method's return type technically allows it.
   *
   */

  get u() { return this.form.get('username')!; }
  get p() { return this.form.get('password')!; }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
