import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./courses-list.page').then((m) => m.CoursesListPage),
  },
];


