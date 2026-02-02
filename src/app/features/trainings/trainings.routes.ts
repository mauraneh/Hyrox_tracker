import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./trainings-list.page').then((m) => m.TrainingsListPage),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./training-edit.page').then((m) => m.TrainingEditPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./training-detail.page').then((m) => m.TrainingDetailPage),
  },
];


