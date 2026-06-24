import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { AuthApiService } from '../../core/api/auth-api.service';
import { AuthStore } from '../../core/auth/auth.store';
import type { LoginResponse } from '../../core/models/auth.model';
import { Login } from './login.component';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authApiMock: { login: ReturnType<typeof vi.fn> };
  let authStore: AuthStore;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    authApiMock = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule],
      providers: [provideRouter([]), { provide: AuthApiService, useValue: authApiMock }, AuthStore],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authStore = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login API and store on successful submit', () => {
    const response: LoginResponse = { token: 'jwt-token', role: 'Admin' };
    authApiMock.login.mockReturnValue(of(response));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.form.setValue({ email: 'admin@example.com', password: 'password' });
    component.onSubmit();

    expect(authApiMock.login).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'password',
    });
    expect(authStore.token()).toBe('jwt-token');
    expect(authStore.role()).toBe('Admin');
    expect(navigateSpy).toHaveBeenCalledWith(['/events']);
  });

  it('should display error message on failed login', () => {
    authApiMock.login.mockReturnValue(throwError(() => new Error('fail')));

    component.form.setValue({ email: 'admin@example.com', password: 'password' });
    component.onSubmit();

    expect(component.errorMessage()).toBe('No se pudo iniciar sesión. Verifique sus credenciales.');
    expect(component.pending()).toBe(false);
  });
});
