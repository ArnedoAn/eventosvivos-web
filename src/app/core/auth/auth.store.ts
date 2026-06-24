import { Injectable, Signal, computed, signal } from '@angular/core';

import type { LoginResponse, Role } from '../models/auth.model';

const TOKEN_KEY = 'eventosvivos_token';
const ROLE_KEY = 'eventosvivos_role';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly _token = signal<string | null>(null);
  private readonly _role = signal<Role | null>(null);

  readonly token: Signal<string | null> = this._token.asReadonly();
  readonly role: Signal<Role | null> = this._role.asReadonly();
  readonly isAuthenticated: Signal<boolean> = computed(() => !!this._token());

  constructor() {
    this.restoreFromStorage();
  }

  login(res: LoginResponse): void {
    this._token.set(res.token);
    this._role.set(res.role);
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(ROLE_KEY, res.role);
  }

  logout(): void {
    this._token.set(null);
    this._role.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  }

  private restoreFromStorage(): void {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) return;

    this._token.set(storedToken);

    // Prefer explicitly stored role (set on login) — avoids JWT claim URI parsing issues
    const storedRole = localStorage.getItem(ROLE_KEY) as Role | null;
    if (storedRole === 'Admin' || storedRole === 'User') {
      this._role.set(storedRole);
    } else {
      // Fallback: try to decode from JWT (only works if backend uses simple 'role' claim key)
      const decoded = decodeRole(storedToken);
      if (decoded) this._role.set(decoded);
    }
  }
}

function decodeRole(token: string): Role | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as Record<
      string,
      unknown
    >;

    // Handle both simple 'role' and the full ClaimTypes.Role URI
    const roleValue =
      payload['role'] ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    return roleValue === 'Admin' || roleValue === 'User' ? roleValue : null;
  } catch {
    return null;
  }
}
