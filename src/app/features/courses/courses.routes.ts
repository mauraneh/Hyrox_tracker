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
];


