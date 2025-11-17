import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '@environments/environment';
import { CommonModule } from '@angular/common';

interface StatsOverview {
  totalCourses: number;
  totalTrainings: number;
  bestTime: number | null;
  latestTime: number | null;
  averageTime: number | null;
  nextHyrox: {
    name: string;
    city: string;
    date: string;
  } | null;
  improvement: number | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-dark-50 dark:bg-dark-900">
      <nav class="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-8">
              <h1 class="text-2xl font-bold text-dark-900 dark:text-white">Hyrox Tracker</h1>
              <nav class="hidden md:flex space-x-4">
                <a routerLink="/dashboard" class="text-primary-500 font-medium">Dashboard</a>
                <a routerLink="/courses" class="text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white">Courses</a>
                <a routerLink="/trainings" class="text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white">Entraînements</a>
                <a routerLink="/stats" class="text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white">Statistiques</a>
              </nav>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-dark-600 dark:text-dark-400">
                {{ currentUser()?.firstName }} {{ currentUser()?.lastName }}
              </span>
              <button (click)="logout()" class="btn-outline text-sm">Déconnexion</button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (isLoading()) {
        <div class="text-center py-12">
          <p class="text-dark-600 dark:text-dark-400">Chargement...</p>
        </div>
        } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <h3 class="text-sm font-medium text-dark-600 dark:text-dark-400 mb-2">Total Courses</h3>
            <p class="text-3xl font-bold text-dark-900 dark:text-white">{{ stats()?.totalCourses || 0 }}</p>
          </div>

          <div class="card">
            <h3 class="text-sm font-medium text-dark-600 dark:text-dark-400 mb-2">Total Entraînements</h3>
            <p class="text-3xl font-bold text-dark-900 dark:text-white">{{ stats()?.totalTrainings || 0 }}</p>
          </div>

          <div class="card">
            <h3 class="text-sm font-medium text-dark-600 dark:text-dark-400 mb-2">Meilleur Temps</h3>
            <p class="text-3xl font-bold text-primary-500">
              {{ stats()?.bestTime ? formatTime(stats()!.bestTime!) : '--:--' }}
            </p>
          </div>

          <div class="card">
            <h3 class="text-sm font-medium text-dark-600 dark:text-dark-400 mb-2">Dernier Temps</h3>
            <p class="text-3xl font-bold text-dark-900 dark:text-white">
              {{ stats()?.latestTime ? formatTime(stats()!.latestTime!) : '--:--' }}
            </p>
          </div>
        </div>

        @if (stats()?.nextHyrox) {
        <div class="card mb-8">
          <h2 class="text-xl font-bold text-dark-900 dark:text-white mb-4">Prochain Hyrox</h2>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg font-medium text-dark-900 dark:text-white">{{ stats()!.nextHyrox!.name }}</p>
              <p class="text-sm text-dark-600 dark:text-dark-400">{{ stats()!.nextHyrox!.city }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-medium text-primary-500">{{ formatDate(stats()!.nextHyrox!.date) }}</p>
            </div>
          </div>
        </div>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-dark-900 dark:text-white">Courses Récentes</h2>
              <a routerLink="/courses" class="text-sm text-primary-500 hover:text-primary-600">Voir tout</a>
            </div>
            <p class="text-dark-600 dark:text-dark-400">Aucune course pour le moment</p>
            <a routerLink="/courses/new" class="btn-primary mt-4">Ajouter une course</a>
          </div>

          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-dark-900 dark:text-white">Entraînements Récents</h2>
              <a routerLink="/trainings" class="text-sm text-primary-500 hover:text-primary-600">Voir tout</a>
            </div>
            <p class="text-dark-600 dark:text-dark-400">Aucun entraînement pour le moment</p>
            <a routerLink="/trainings/new" class="btn-primary mt-4">Ajouter un entraînement</a>
          </div>
        </div>
        }
      </main>
    </div>
  `,
})
export class DashboardPage implements OnInit {
  #authService = inject(AuthService);
  #http = inject(HttpClient);

  currentUser = this.#authService.currentUser;
  stats = signal<StatsOverview | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.#http.get<{ success: boolean; data: StatsOverview }>(`${environment.apiUrl}/stats/overview`).subscribe({
      next: (response) => {
        this.stats.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  logout() {
    this.#authService.logout();
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}


