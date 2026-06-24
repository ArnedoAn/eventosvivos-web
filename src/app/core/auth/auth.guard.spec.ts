import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { describe, expect, it } from 'vitest';

import type { Role } from '../models/auth.model';
import { authGuard } from './auth.guard';
import { AuthStore } from './auth.store';

@Component({ selector: 'app-stub', template: '' })
class StubComponent {}

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function setup(requiredRole?: Role) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: StubComponent },
          { path: 'events', component: StubComponent },
        ]),
        AuthStore,
      ],
    });

    const router = TestBed.inject(Router);
    const authStore = TestBed.inject(AuthStore);
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const runGuard = () =>
      TestBed.runInInjectionContext(() => authGuard(requiredRole)(route, state));

    return { router, authStore, runGuard };
  }

  it('should redirect to /login when not authenticated', () => {
    const { router, runGuard } = setup();

    expect(runGuard()).toEqual(router.createUrlTree(['/login']));
  });

  it('should redirect to /events when role does not match', () => {
    const { router, authStore, runGuard } = setup('Admin');

    authStore.login({ token: 'token', role: 'User' });

    expect(runGuard()).toEqual(router.createUrlTree(['/events']));
  });

  it('should allow access when authenticated and role matches', () => {
    const { authStore, runGuard } = setup('Admin');

    authStore.login({ token: 'token', role: 'Admin' });

    expect(runGuard()).toBe(true);
  });
});
