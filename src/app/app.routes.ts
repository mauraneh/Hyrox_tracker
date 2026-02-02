import { Routes } from '@angular/router';
import { authGuard } from 'src/app/core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.routes),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'courses',
    canActivate: [authGuard],
    loadChildren: () => import('./features/courses/courses.routes').then((m) => m.routes),
  },
  {
    path: 'trainings',
    canActivate: [authGuard],
    loadChildren: () => import('./features/trainings/trainings.routes').then((m) => m.routes),
  },
  {
    path: 'stats',
    canActivate: [authGuard],
    loadComponent: () => import('./features/stats/stats.page').then((m) => m.StatsPage),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];


