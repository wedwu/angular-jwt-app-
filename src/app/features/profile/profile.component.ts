import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { AuthService } from '@/core/services/auth.service';
import { ApiService } from '@/core/services/api.service';
import { User } from '@/core/models/user.model';

@Component({ selector: 'app-profile', templateUrl: './profile.component.html', styleUrls: ['./profile.component.scss'] })
export class ProfileComponent implements OnInit {
  user!: User;
  profileForm!: FormGroup;
  isSaving = false;

  constructor(private auth: AuthService, private api: ApiService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser!;
    this.profileForm = this.fb.group({
      firstName: [this.user.firstName, Validators.required],
      lastName:  [this.user.lastName,  Validators.required],
      email:     [this.user.email,     [Validators.required, Validators.email]],
    });
  }

  save(): void {
    if (this.profileForm.invalid) return;
    this.isSaving = true;
    this.api.updateUser(this.user.id, this.profileForm.value).pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: updated => { this.auth.updateLocalUser(updated); this.user = updated; this.snack.open('Profile updated!', '', { duration: 3000, panelClass: ['success-snack'] }); },
      error: () => this.snack.open('Update failed.', 'Close', { duration: 3000, panelClass: ['error-snack'] }),
    });
  }

  get initials(): string { return (this.user.firstName[0] ?? '') + (this.user.lastName[0] ?? ''); }
  get roleColor(): string { return ({ admin: '#3f51b5', manager: '#ff6f00', user: '#43a047' } as any)[this.user.role] ?? '#888'; }
}
