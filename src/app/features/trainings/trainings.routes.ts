import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./trainings-list.page').then((m) => m.TrainingsListPage),
  },
];


