import { TestBed } from '@angular/core/testing';

import type { LoginResponse } from '../models/auth.model';
import { AuthStore } from './auth.store';

const TOKEN_KEY = 'eventosvivos_token';
const ROLE_KEY = 'eventosvivos_role';

function buildJwt(payload: Record<string, unknown>): string {
  const header = btoa('{}');
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('AuthStore', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('is not authenticated initially when localStorage is empty', () => {
    const store = TestBed.inject(AuthStore);
    expect(store.token()).toBeNull();
    expect(store.role()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('login() sets token and role in memory and storage', () => {
    const store = TestBed.inject(AuthStore);
    const res: LoginResponse = { token: 'jwt-token', role: 'Admin' };

    store.login(res);

    expect(store.token()).toBe('jwt-token');
    expect(store.role()).toBe('Admin');
    expect(store.isAuthenticated()).toBe(true);
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-token');
    expect(localStorage.getItem(ROLE_KEY)).toBe('Admin');
  });

  it('logout() clears memory and both storage keys', () => {
    const store = TestBed.inject(AuthStore);
    store.login({ token: 'jwt-token', role: 'User' });

    store.logout();

    expect(store.token()).toBeNull();
    expect(store.role()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(ROLE_KEY)).toBeNull();
  });

  it('restores token and role from explicit ROLE_KEY on reload', () => {
    localStorage.setItem(TOKEN_KEY, 'some-token');
    localStorage.setItem(ROLE_KEY, 'Admin');

    const store = TestBed.inject(AuthStore);

    expect(store.token()).toBe('some-token');
    expect(store.role()).toBe('Admin');
    expect(store.isAuthenticated()).toBe(true);
  });

  it('falls back to JWT decode when ROLE_KEY absent (simple role claim)', () => {
    const token = buildJwt({ role: 'User', sub: 'usr-1' });
    localStorage.setItem(TOKEN_KEY, token);
    // ROLE_KEY intentionally not set

    const store = TestBed.inject(AuthStore);

    expect(store.token()).toBe(token);
    expect(store.role()).toBe('User');
  });

  it('falls back to JWT decode with full ClaimTypes.Role URI key', () => {
    const claimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    const token = buildJwt({ [claimKey]: 'Admin', sub: 'usr-1' });
    localStorage.setItem(TOKEN_KEY, token);

    const store = TestBed.inject(AuthStore);

    expect(store.role()).toBe('Admin');
  });
});
