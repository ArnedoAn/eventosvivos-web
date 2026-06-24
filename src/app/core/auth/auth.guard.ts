import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import type { Role } from '../models/auth.model';
import { AuthStore } from './auth.store';

export const authGuard = (requiredRole?: Role): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (!authStore.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    if (requiredRole && authStore.role() !== requiredRole) {
      return router.createUrlTree(['/events']);
    }

    return true;
  };
};
