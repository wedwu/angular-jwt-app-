import {
  Injectable
} from '@angular/core';
import {
  CanActivate, CanActivateChild, Router,
  ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(_r: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.auth.isAuthenticated()
      ? true
      : this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  canActivateChild(r: ActivatedRouteSnapshot, s: RouterStateSnapshot): boolean | UrlTree {
    return this.canActivate(r, s);
  }
}
