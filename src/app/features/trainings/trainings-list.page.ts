import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Training } from 'src/app/core/types/interfaces';
import { environment } from 'src/environments/environment';

type TrainingSortOrder = 'date-desc' | 'date-asc' | 'type-asc' | 'type-desc' | 'difficulty-asc' | 'difficulty-desc';

function compareTrainings(a: Training, b: Training, order: TrainingSortOrder): number {
  switch (order) {
    case 'date-desc':
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    case 'date-asc':
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    case 'type-asc':
      return (a.type ?? '').localeCompare(b.type ?? '', 'fr');
    case 'type-desc':
      return (b.type ?? '').localeCompare(a.type ?? '', 'fr');
    case 'difficulty-asc': {
      const orderDiff = ['novice', 'intermediate', 'expert'];
      const ia = orderDiff.indexOf((a.difficulty ?? '').toLowerCase());
      const ib = orderDiff.indexOf((b.difficulty ?? '').toLowerCase());
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    }
    case 'difficulty-desc': {
      const orderDiff = ['expert', 'intermediate', 'novice'];
      const ia = orderDiff.indexOf((a.difficulty ?? '').toLowerCase());
      const ib = orderDiff.indexOf((b.difficulty ?? '').toLowerCase());
      return (ia === -1 ? -1 : ia) - (ib === -1 ? -1 : ib);
    }
    default:
      return 0;
  }
}

@Component({
  selector: 'app-trainings-list',
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

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide">Mes entraînements</h1>
          <div class="flex flex-wrap items-center gap-3">
            <a routerLink="/create-training" class="btn-primary inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un entraînement
            </a>
          </div>
        </div>

        @if (isLoading()) {
          <div class="text-center py-12">
            <p class="text-hyrox-gray-400">Chargement des entraînements...</p>
          </div>
        } @else if (errorMessage()) {
          <div class="card border-red-900/30">
            <p class="text-red-400">{{ errorMessage() }}</p>
            <button type="button" (click)="loadTrainings()" class="btn-outline mt-4">Réessayer</button>
          </div>
        } @else if (trainings().length === 0) {
          <div class="card text-center py-12">
            <p class="text-hyrox-gray-400 mb-6">Aucun entraînement enregistré.</p>
            <a routerLink="/create-training" class="btn-primary">Ajouter un entraînement</a>
          </div>
        } @else {
          <!-- Filtres et tri -->
          <div class="card border-hyrox-gray-800 mb-6">
            <div class="flex flex-wrap items-end gap-4">
              <div class="flex flex-col gap-1">
                <label for="sort-order" class="text-xs font-medium text-hyrox-gray-400">Tri</label>
                <select
                  id="sort-order"
                  [value]="sortOrder()"
                  (change)="sortOrder.set($any($event.target).value)"
                  class="input min-w-[200px]"
                >
                  @for (opt of sortOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label for="filter-type" class="text-xs font-medium text-hyrox-gray-400">Type</label>
                <select
                  id="filter-type"
                  [value]="filterType()"
                  (change)="filterType.set($any($event.target).value)"
                  class="input min-w-[140px]"
                >
                  <option value="">Tous</option>
                  @for (type of uniqueTypes(); track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label for="filter-difficulty" class="text-xs font-medium text-hyrox-gray-400">Niveau</label>
                <select
                  id="filter-difficulty"
                  [value]="filterDifficulty()"
                  (change)="filterDifficulty.set($any($event.target).value)"
                  class="input min-w-[140px]"
                >
                  @for (opt of difficultyFilterOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
              <button type="button" (click)="resetFilters()" class="btn-outline shrink-0">
                Réinitialiser les filtres
              </button>
            </div>
            <p class="text-hyrox-gray-400 text-sm mt-3">
              {{ filteredTrainings().length }} entraînement(s) affiché(s)
              @if (filteredTrainings().length !== trainings().length) {
                sur {{ trainings().length }}
              }
            </p>
          </div>

          @if (filteredTrainings().length === 0) {
            <div class="card text-center py-12">
              <p class="text-hyrox-gray-400 mb-6">Aucun entraînement ne correspond aux filtres.</p>
              <button type="button" (click)="resetFilters()" class="btn-outline">Réinitialiser les filtres</button>
            </div>
          } @else {
          <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
            @for (t of filteredTrainings(); track t.id) {
              <li>
                <div class="card border-hyrox-gray-800 hover:border-hyrox-yellow/30 transition-colors h-full flex flex-col">
                  <div class="flex justify-between items-start gap-2">
                    <a [routerLink]="['/trainings', t.id]" class="flex flex-col flex-1 min-w-0">
                      <h2 class="text-xl font-bold text-white mb-2">{{ t.type }}</h2>
                      @if (t.exerciseName) {
                        <p class="text-hyrox-gray-400 text-sm mb-1">{{ t.exerciseName }}</p>
                      }
                      <p class="text-hyrox-yellow font-semibold text-sm mb-3">{{ formatDate(t.date) }}</p>
                      <div class="flex flex-wrap gap-2 mt-auto">
                        @if (t.durationSeconds != null && t.durationSeconds > 0) {
                          <span class="inline-block px-2 py-1 rounded bg-hyrox-gray-800 text-hyrox-gray-300 text-xs font-medium">{{ formatDuration(t.durationSeconds) }}</span>
                        }
                        @if (t.distanceMeters != null && t.distanceMeters > 0) {
                          <span class="inline-block px-2 py-1 rounded bg-hyrox-yellow/20 text-hyrox-yellow text-xs font-semibold">{{ formatDistance(t.distanceMeters) }}</span>
                        }
                        @if (t.rounds != null && t.rounds > 0) {
                          <span class="inline-block px-2 py-1 rounded bg-hyrox-gray-800 text-hyrox-gray-300 text-xs font-medium">{{ t.rounds }} rounds</span>
                        }
                      </div>
                    </a>
                    <div class="flex gap-1 flex-shrink-0">
                      <a
                        [routerLink]="['/trainings', t.id, 'edit']"
                        (click)="$event.stopPropagation()"
                        class="p-2 rounded-lg text-hyrox-gray-400 hover:text-hyrox-yellow hover:bg-hyrox-gray-800 transition-colors"
                        title="Modifier"
                        aria-label="Modifier l'entraînement"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                      <button
                        type="button"
                        (click)="requestConfirmDelete($event, t.id)"
                        [disabled]="deletingId() === t.id"
                        class="p-2 rounded-lg text-hyrox-gray-400 hover:text-red-400 hover:bg-hyrox-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer"
                        aria-label="Supprimer l'entraînement"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            }
          </ul>
          }
        }
      </main>

      @if (confirmDeleteId()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
          <div class="rounded-xl border border-hyrox-gray-800 bg-hyrox-gray-900 p-6 shadow-xl border-hyrox-yellow/30 max-w-sm w-full">
            <h2 id="confirm-delete-title" class="text-lg font-bold text-white mb-3">Supprimer l'entraînement</h2>
            <p class="text-hyrox-gray-300 mb-6">Voulez-vous vraiment supprimer cet entraînement ?</p>
            <div class="flex gap-3 justify-end">
              <button type="button" class="btn-secondary" (click)="cancelDelete()">Non</button>
              <button type="button" class="btn-primary bg-red-600 hover:bg-red-500 text-white" (click)="confirmDelete()" [disabled]="deletingId() !== null">
                {{ deletingId() ? 'Suppression...' : 'Oui' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TrainingsListPage implements OnInit {
  #authService = inject(AuthService);
  #http = inject(HttpClient);

  currentUser = this.#authService.currentUser;
  showUserMenu = signal(false);
  trainings = signal<Training[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  deletingId = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);

  filterType = signal<string>('');
  filterDifficulty = signal<string>('');
  sortOrder = signal<TrainingSortOrder>('date-desc');

  readonly sortOptions: { value: TrainingSortOrder; label: string }[] = [
    { value: 'date-desc', label: 'Date (récent → ancien)' },
    { value: 'date-asc', label: 'Date (ancien → récent)' },
    { value: 'type-asc', label: 'Type (A-Z)' },
    { value: 'type-desc', label: 'Type (Z-A)' },
    { value: 'difficulty-asc', label: 'Niveau (Novice → Expert)' },
    { value: 'difficulty-desc', label: 'Niveau (Expert → Novice)' },
  ];

  readonly difficultyFilterOptions: { value: string; label: string }[] = [
    { value: '', label: 'Tous' },
    { value: 'novice', label: 'Novice' },
    { value: 'intermediate', label: 'Intermédiaire' },
    { value: 'expert', label: 'Expert' },
  ];

  uniqueTypes = computed(() => {
    const list = this.trainings();
    return [...new Set(list.map((t) => t.type).filter(Boolean))].sort();
  });

  filteredTrainings = computed(() => {
    const list = this.trainings();
    const typeFilter = this.filterType().trim();
    const difficultyFilter = this.filterDifficulty().trim().toLowerCase();
    const order = this.sortOrder();
    let result = list.filter((t) => {
      if (typeFilter && t.type !== typeFilter) return false;
      if (difficultyFilter) {
        const d = (t.difficulty ?? '').toLowerCase();
        if (d !== difficultyFilter) return false;
      }
      return true;
    });
    result = [...result].sort((a, b) => compareTrainings(a, b, order));
    return result;
  });

  #router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/trainings`;

  ngOnInit(): void {
    this.loadTrainings();
    document.addEventListener('click', (event) => {
      if (this.showUserMenu()) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          this.closeUserMenu();
        }
      }
    });
  }

  loadTrainings(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const token = this.#authService.getToken();
    if (!token) {
      this.isLoading.set(false);
      this.errorMessage.set('Vous devez être connecté.');
      return;
    }

    this.#http
      .get<{ success: boolean; data: Training[] }>(this.apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (response) => {
          const list = Array.isArray(response.data) ? response.data : [];
          this.trainings.set(list);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message ?? 'Impossible de charger les entraînements.');
          this.isLoading.set(false);
        },
      });
  }

  requestConfirmDelete(event: Event, id: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  resetFilters(): void {
    this.filterType.set('');
    this.filterDifficulty.set('');
    this.sortOrder.set('date-desc');
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (!id) return;

    this.deletingId.set(id);

    const token = this.#authService.getToken();
    if (!token) {
      this.deletingId.set(null);
      this.confirmDeleteId.set(null);
      return;
    }

    this.#http
      .delete(`${this.apiUrl}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => {
          this.trainings.update((list) => list.filter((t) => t.id !== id));
          this.deletingId.set(null);
          this.confirmDeleteId.set(null);
        },
        error: () => {
          this.errorMessage.set('Impossible de supprimer l\'entraînement.');
          this.deletingId.set(null);
          this.confirmDeleteId.set(null);
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
      month: 'short',
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
