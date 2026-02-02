import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Training } from 'src/app/core/types/interfaces';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-training-detail',
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
                <a routerLink="/dashboard" class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors">Dashboard</a>
                <a routerLink="/courses" class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors">Courses</a>
                <a routerLink="/trainings" class="text-hyrox-yellow font-bold text-sm uppercase tracking-wide hover:text-white transition-colors">Entraînements</a>
                <a routerLink="/stats" class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors">Statistiques</a>
              </nav>
            </div>
            <div class="flex items-center space-x-4">
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

      <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (isLoading()) {
          <div class="card border-hyrox-yellow/20">
            <p class="text-hyrox-gray-400 text-center py-8">Chargement...</p>
          </div>
        } @else if (errorMessage()) {
          <div class="card border-red-500/30">
            <p class="text-red-400">{{ errorMessage() }}</p>
            <a routerLink="/trainings" class="btn-outline mt-4 inline-block">Retour à la liste</a>
          </div>
        } @else if (training()) {
          <div class="flex items-center justify-between gap-4 mb-8">
            <a routerLink="/trainings" class="btn-outline">Retour</a>
            <a [routerLink]="['/trainings', training()!.id, 'edit']" class="btn-primary">Modifier</a>
          </div>

          <div class="card border-hyrox-yellow/20">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-black text-hyrox-yellow uppercase tracking-wide">{{ training()!.type }}</h1>
              @if (training()!.exerciseName) {
                <span class="text-sm font-semibold text-white">{{ training()!.exerciseName }}</span>
              }
            </div>

            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-1">Date</dt>
                <dd class="text-white font-medium">{{ formatDate(training()!.date) }}</dd>
              </div>
              @if (training()!.format) {
                <div>
                  <dt class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-1">Format</dt>
                  <dd class="text-white font-medium">{{ training()!.format }}</dd>
                </div>
              }
              @if ((training()?.rounds ?? 0) > 0) {
                <div>
                  <dt class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-1">Rounds</dt>
                  <dd class="text-white font-medium">{{ training()!.rounds }}</dd>
                </div>
              }
              @if ((training()?.sets ?? 0) > 0) {
                <div>
                  <dt class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-1">Sets</dt>
                  <dd class="text-white font-medium">{{ training()!.sets }}</dd>
                </div>
              }
              @if ((training()?.reps ?? 0) > 0) {
                <div>
                  <dt class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-1">Reps</dt>
                  <dd class="text-white font-medium">{{ training()!.reps }}</dd>
                </div>
              }
              @if ((training()?.durationSeconds ?? 0) > 0) {
                <div>
                  <dt class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-1">Durée</dt>
                  <dd class="text-white font-medium">{{ formatDuration(training()!.durationSeconds!) }}</dd>
                </div>
              }
              @if ((training()?.distanceMeters ?? 0) > 0) {
                <div>
                  <dt class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-1">Distance</dt>
                  <dd class="text-white font-medium">{{ formatDistance(training()!.distanceMeters!) }}</dd>
                </div>
              }
              @if ((training()?.restSeconds ?? 0) > 0) {
                <div>
                  <dt class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-1">Repos</dt>
                  <dd class="text-white font-medium">{{ training()!.restSeconds }} sec</dd>
                </div>
              }
              @if ((training()?.weightKg ?? 0) > 0) {
                <div>
                  <dt class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-1">Charge</dt>
                  <dd class="text-white font-medium">{{ training()!.weightKg }} kg</dd>
                </div>
              }
            </dl>

            @if (training()!.comment) {
              <div class="mt-6 pt-6 border-t border-hyrox-gray-800">
                <dt class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-2">Commentaire</dt>
                <dd class="text-hyrox-gray-300 whitespace-pre-wrap">{{ training()!.comment }}</dd>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
})
export class TrainingDetailPage implements OnInit {
  #authService = inject(AuthService);
  #http = inject(HttpClient);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  currentUser = this.#authService.currentUser;
  showUserMenu = signal(false);
  training = signal<Training | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  private readonly apiUrl = `${environment.apiUrl}/trainings`;

  ngOnInit(): void {
    document.addEventListener('click', (event) => {
      if (this.showUserMenu()) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          this.closeUserMenu();
        }
      }
    });

    const id = this.#route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTraining(id);
    } else {
      this.errorMessage.set('Entraînement introuvable.');
      this.isLoading.set(false);
    }
  }

  loadTraining(id: string): void {
    const token = this.#authService.getToken();
    if (!token) {
      this.errorMessage.set('Vous devez être connecté.');
      this.isLoading.set(false);
      return;
    }

    this.#http
      .get<{ success: boolean; data: Training }>(`${this.apiUrl}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (response) => {
          this.training.set(response.data ?? null);
          this.isLoading.set(false);
          if (!response.data) {
            this.errorMessage.set('Entraînement introuvable.');
          }
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message ?? 'Impossible de charger l\'entraînement.');
          this.isLoading.set(false);
        },
      });
  }

  toggleUserMenu(event?: Event): void {
    if (event) event.stopPropagation();
    this.showUserMenu.update((v) => !v);
  }

  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  logout(): void {
    this.#authService.logout();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) {
      return `${h}h ${m}min`;
    }
    return m > 0 ? `${m} min` : `${seconds} sec`;
  }

  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  }
}
