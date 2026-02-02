import { Routes } from '@angular/router';
import { authGuard } from 'src/app/core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./courses-list.page').then((m) => m.CoursesListPage),
  },
  {
    path: 'new',
    canActivate: [authGuard],
    loadComponent: () => import('./course-new.page').then((m) => m.CourseNewPage),
  },
  {
    path: 'import',
    canActivate: [authGuard],
    loadComponent: () => import('./course-import.page').then((m) => m.CourseImportPage),
  },
  {
    path: ':id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./course-edit.page').then((m) => m.CourseEditPage),
  },
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () => import('./course-detail.page').then((m) => m.CourseDetailPage),
  },
];


