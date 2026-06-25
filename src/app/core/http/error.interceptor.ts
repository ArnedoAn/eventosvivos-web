import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthStore } from '../auth/auth.store';
import { NotificationService } from '../notifications/notification.service';
import { mapErrorToSpanish } from './error-messages';

export interface ProblemDetails {
  code?: string;
  detail?: string;
  title?: string;
  status?: number;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const problem = extractProblemDetails(error);

      if (problem.status === 401 && authStore.isAuthenticated()) {
        authStore.logout();
        void router.navigate(['/login']);
      }

      const message = mapErrorToSpanish(problem.detail, problem.code, problem.status);
      notificationService.push({ text: message, type: 'error' });
      return throwError(() => error);
    }),
  );
};

function extractProblemDetails(error: unknown): ProblemDetails {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Record<string, unknown> | undefined;
    if (body && typeof body === 'object') {
      return {
        // tolerate both camelCase (4xx) and PascalCase (500 from middleware)
        code: (body['code'] ?? body['Code']) as string | undefined,
        detail: (body['detail'] ?? body['Detail']) as string | undefined,
        title: (body['title'] ?? body['Title']) as string | undefined,
        status: error.status,
      };
    }
    return { title: error.message, status: error.status };
  }
  return { title: error instanceof Error ? error.message : 'Unknown error' };
}
