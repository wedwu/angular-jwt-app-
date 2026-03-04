import { Injectable } from '@angular/core';
import {
  CanActivate, ActivatedRouteSnapshot, Router, UrlTree
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

/*
 *
 * This decorator marks a class as injectable (available for Angular's dependency injection system) and providedIn: 'root' means 
 * Angular creates a single shared instance (singleton) of it at the application root level, making it available everywhere without 
 * needing to register it manually in any module's providers array.
 *
 */

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private auth:   AuthService,
    private router: Router,
    private snack:  MatSnackBar
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const required: string[] = route.data['roles'] ?? [];
    if (!required.length || this.auth.hasRole(...required)) return true;

    this.snack.open('Access denied: insufficient permissions.', 'Dismiss', {
      duration: 3000, panelClass: ['error-snack'],
    });
    return this.router.createUrlTree(['/dashboard']);
  }
}
