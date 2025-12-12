import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '@environments/environment';
import { CommonModule } from '@angular/common';
import { StatsOverview } from '@core/types/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <nav class="bg-hyrox-gray-900 border-b border-hyrox-gray-800 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-20">
            <div class="flex items-center space-x-8">
              <h1 class="hyrox-title">Hyrox Tracker</h1>
              <nav class="hidden md:flex space-x-6">
                <a routerLink="/dashboard" class="text-hyrox-yellow font-bold text-sm uppercase tracking-wide hover:text-white transition-colors">Dashboard</a>
                <a routerLink="/courses" class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors">Courses</a>
                <a routerLink="/trainings" class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors">Entraînements</a>
                <a routerLink="/stats" class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors">Statistiques</a>
              </nav>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Menu utilisateur -->
              <div class="relative user-menu-container">
                <button
                  (click)="toggleUserMenu($event)"
                  (keydown.enter)="toggleUserMenu($event)"
                  class="flex items-center space-x-2 text-sm text-white hover:text-hyrox-yellow cursor-pointer font-semibold transition-colors bg-transparent border-none p-2 rounded-lg hover:bg-hyrox-gray-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                @if (showUserMenu()) {
                <div class="absolute right-0 mt-2 w-48 bg-hyrox-gray-900 rounded-lg shadow-xl border-2 border-hyrox-yellow py-1 z-50">
                  <a routerLink="/profile" (click)="closeUserMenu()" class="block px-4 py-2 text-sm text-white hover:bg-hyrox-gray-800 hover:text-hyrox-yellow transition-colors">
                    <div class="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profil</span>
                    </div>
                  </a>
                  <a routerLink="/settings" (click)="closeUserMenu()" class="block px-4 py-2 text-sm text-white hover:bg-hyrox-gray-800 hover:text-hyrox-yellow transition-colors">
                    <div class="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Paramètres</span>
                    </div>
                  </a>
                  <div class="border-t border-hyrox-gray-800 my-1"></div>
                  <button (click)="logout()" class="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors">
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
          <p class="text-hyrox-gray-400">Chargement...</p>
        </div>
        } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card border-hyrox-yellow/20">
            <h3 class="text-xs font-semibold text-hyrox-gray-400 mb-2 uppercase tracking-wide">Total Courses</h3>
            <p class="text-4xl font-black text-hyrox-yellow">{{ stats()?.totalCourses || 0 }}</p>
          </div>

          <div class="card border-hyrox-yellow/20">
            <h3 class="text-xs font-semibold text-hyrox-gray-400 mb-2 uppercase tracking-wide">Total Entraînements</h3>
            <p class="text-4xl font-black text-white">{{ stats()?.totalTrainings || 0 }}</p>
          </div>

          <div class="card border-hyrox-yellow/20">
            <h3 class="text-xs font-semibold text-hyrox-gray-400 mb-2 uppercase tracking-wide">Meilleur Temps</h3>
            <p class="text-4xl font-black text-hyrox-yellow">
              {{ stats()?.bestTime ? formatTime(stats()!.bestTime!) : '--:--' }}
            </p>
          </div>

          <div class="card border-hyrox-yellow/20">
            <h3 class="text-xs font-semibold text-hyrox-gray-400 mb-2 uppercase tracking-wide">Dernier Temps</h3>
            <p class="text-4xl font-black text-white">
              {{ stats()?.latestTime ? formatTime(stats()!.latestTime!) : '--:--' }}
            </p>
          </div>
        </div>

        @if (stats()?.nextHyrox) {
        <div class="card mb-8 border-hyrox-yellow/30">
          <h2 class="text-xl font-black text-hyrox-yellow mb-4 uppercase tracking-wide">Prochain Hyrox</h2>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg font-bold text-white">{{ stats()!.nextHyrox!.name }}</p>
              <p class="text-sm text-hyrox-gray-400">{{ stats()!.nextHyrox!.city }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-hyrox-yellow">{{ formatDate(stats()!.nextHyrox!.date) }}</p>
            </div>
          </div>
        </div>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card border-hyrox-yellow/20">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-black text-white uppercase tracking-wide">Courses Récentes</h2>
              <a routerLink="/courses" class="text-sm text-hyrox-yellow hover:text-white font-semibold transition-colors">Voir tout</a>
            </div>
            <p class="text-hyrox-gray-400">Aucune course pour le moment</p>
            <a routerLink="/courses/new" class="btn-primary mt-4">Ajouter une course</a>
          </div>

          <div class="card border-hyrox-yellow/20">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-black text-white uppercase tracking-wide">Entraînements Récents</h2>
              <a routerLink="/trainings" class="text-sm text-hyrox-yellow hover:text-white font-semibold transition-colors">Voir tout</a>
            </div>
            <p class="text-hyrox-gray-400">Aucun entraînement pour le moment</p>
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
