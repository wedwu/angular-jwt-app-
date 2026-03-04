import { Component, OnInit } from '@angular/core';
import { AuthService } from '@/core/services/auth.service';
import { User } from '@/core/models/user.model';

@Component({ selector: 'app-navbar', templateUrl: './navbar.component.html', styleUrls: ['./navbar.component.scss'] })
export class NavbarComponent implements OnInit {
  user: User | null = null;
  allLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard',     adminOnly: false },
    { path: '/users',     label: 'Users',     icon: 'group',         adminOnly: true  },
    { path: '/profile',   label: 'Profile',   icon: 'account_circle',adminOnly: false },
  ];
  constructor(private auth: AuthService) {}
  ngOnInit(): void { this.user = this.auth.currentUser; }
  get links() { return this.allLinks.filter(l => !l.adminOnly || this.auth.hasRole('admin','manager')); }
  get initials(): string { if (!this.user) return '?'; return (this.user.firstName[0] ?? '') + (this.user.lastName[0] ?? ''); }
  logout(): void { this.auth.logout(); }
}
