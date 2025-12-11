import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '@environments/environment';
import { CommonModule } from '@angular/common';
import { StatsOverview } from '@core/types/interfaces';

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
              <!-- Menu utilisateur -->
              <div class="relative user-menu-container">
                <button (click)="toggleUserMenu($event)" class="flex items-center space-x-2 text-sm text-dark-600 dark:text-dark-400 hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer font-medium transition-colors bg-transparent border-none p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                @if (showUserMenu()) {
                <div (click)="$event.stopPropagation()" class="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-dark-200 dark:border-dark-700 py-1 z-50">
                  <a routerLink="/profile" (click)="closeUserMenu()" class="block px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700">
                    <div class="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profil</span>
                    </div>
                  </a>
                  <a routerLink="/settings" (click)="closeUserMenu()" class="block px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700">
                    <div class="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Paramètres</span>
                    </div>
                  </a>
                  <div class="border-t border-dark-200 dark:border-dark-700 my-1"></div>
                  <button (click)="logout()" class="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <div class="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Déconnexion</span>
                    </div>
                  </button>
                </div>
                }
              </div>
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
  #router = inject(Router);

  currentUser = this.#authService.currentUser;
  stats = signal<StatsOverview | null>(null);
  isLoading = signal(true);
  showUserMenu = signal(false);

  ngOnInit() {
    this.loadStats();
    // Fermer le menu si on clique en dehors
    document.addEventListener('click', (event) => {
      if (this.showUserMenu()) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          this.closeUserMenu();
        }
      }
    });
  }

  toggleUserMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const currentValue = this.showUserMenu();
    this.showUserMenu.set(!currentValue);
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
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


