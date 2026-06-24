import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.Login),
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/event-list.component').then((m) => m.EventList),
  },
  {
    path: 'events/new',
    loadComponent: () =>
      import('./features/events/event-create.component').then((m) => m.EventCreate),
    canActivate: [authGuard('Admin')],
  },
  {
    path: 'events/:id/occupancy',
    loadComponent: () => import('./features/reports/occupancy.component').then((m) => m.Occupancy),
  },
  {
    path: 'admin/reservations',
    loadComponent: () =>
      import('./features/reservations/reservation-admin.component').then((m) => m.ReservationAdmin),
    canActivate: [authGuard('Admin')],
  },
  { path: '', redirectTo: '/events', pathMatch: 'full' },
];
