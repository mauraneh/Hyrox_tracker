import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-dark-50 dark:bg-dark-900">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-dark-900 dark:text-white mb-6">Mes Courses</h1>
        <div class="card">
          <p class="text-dark-600 dark:text-dark-400">Page courses en construction...</p>
          <a routerLink="/dashboard" class="btn-primary mt-4">Retour au dashboard</a>
        </div>
      </div>
    </div>
  `,
})
export class CoursesListPage {}


