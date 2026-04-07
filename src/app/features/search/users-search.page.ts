import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';

type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  category: string | null;
};

const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 30;

@Component({
  selector: 'app-users-search',
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
                <a
                  routerLink="/dashboard"
                  class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors"
                  >Dashboard</a
                >
                <a
                  routerLink="/courses"
                  class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors"
                  >Courses</a
                >
                <a
                  routerLink="/trainings"
                  class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors"
                  >Entraînements</a
                >
                <a
                  routerLink="/stats"
                  class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors"
                  >Statistiques</a
                >
                <a
                  routerLink="/search"
                  class="text-hyrox-yellow font-bold text-sm uppercase tracking-wide hover:text-white transition-colors"
                  >Recherche</a
                >
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
                  <a routerLink="/profile" (click)="closeUserMenu()" class="block px-4 py-2 text-sm text-white hover:bg-hyrox-gray-800 hover:text-hyrox-yellow transition-colors">Profil</a>
                  <a routerLink="/settings" (click)="closeUserMenu()" class="block px-4 py-2 text-sm text-white hover:bg-hyrox-gray-800 hover:text-hyrox-yellow transition-colors">Paramètres</a>
                  <div class="border-t border-hyrox-gray-800 my-1"></div>
                  <button (click)="logout(); closeUserMenu()" class="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors">
                    Déconnexion
                  </button>
                </div>
                }
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-4xl font-black text-hyrox-yellow mb-6 uppercase tracking-wide">Recherche</h1>

        <div class="card mb-8">
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              class="input flex-1"
              type="text"
              [value]="query()"
              (input)="onQueryChange($any($event.target).value)"
              [attr.maxlength]="maxQueryLength"
              placeholder="Rechercher un utilisateur (prénom ou nom)"
            />
            <button type="button" class="btn-primary" (click)="searchNow()" [disabled]="isLoading() || !canSearch()">
              Rechercher
            </button>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <p class="text-xs text-hyrox-gray-400">
              @if (query().trim().length > 0 && query().trim().length < minQueryLength) {
                Saisissez au moins {{ minQueryLength }} caractères pour lancer la recherche.
              } @else {
                Seuls les profils publics apparaissent dans la recherche.
              }
            </p>
            <span class="text-xs text-hyrox-gray-500">{{ query().length }}/{{ maxQueryLength }}</span>
          </div>
        </div>

        @if (isLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of skeletons(); track i) {
          <div class="card animate-pulse">
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-full bg-hyrox-gray-800"></div>
              <div class="flex-1">
                <div class="h-4 bg-hyrox-gray-800 rounded w-2/3 mb-2"></div>
                <div class="h-3 bg-hyrox-gray-800 rounded w-1/3"></div>
              </div>
            </div>
          </div>
          }
        </div>
        } @else if (error()) {
        <div class="card border-red-500">
          <p class="text-red-400 text-sm">{{ error() }}</p>
        </div>
        } @else if (results().length === 0) {
        <div class="card text-center py-12">
          <p class="text-hyrox-gray-400">Aucun utilisateur trouvé</p>
        </div>
        } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (u of results(); track u.id) {
          <button
            type="button"
            class="card cursor-pointer hover:border-hyrox-yellow/30 transition-colors block text-left w-full"
            (click)="goToUser(u.id)"
            aria-label="Voir le profil public"
          >
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-full overflow-hidden bg-hyrox-gray-800 flex items-center justify-center">
                @if (u.avatar) {
                <img [src]="u.avatar" [alt]="displayName(u)" class="h-full w-full object-cover" />
                } @else {
                <span class="text-hyrox-yellow font-bold">{{ initials(u) }}</span>
                }
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-white truncate">{{ displayName(u) }}</p>
                @if (u.category) {
                <p class="text-sm text-hyrox-gray-400 truncate">{{ u.category }}</p>
                }
              </div>
            </div>
          </button>
          }
        </div>
        }
      </main>
    </div>
  `,
})
export class UsersSearchPage implements OnDestroy {
  #authService = inject(AuthService);
  #http = inject(HttpClient);
  #router = inject(Router);

  currentUser = this.#authService.currentUser;
  showUserMenu = signal(false);

  query = signal('');
  results = signal<PublicUser[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  skeletons = computed(() => Array.from({ length: 6 }, (_, i) => i));
  readonly minQueryLength = MIN_QUERY_LENGTH;
  readonly maxQueryLength = MAX_QUERY_LENGTH;
  canSearch = computed(() => this.query().trim().length >= MIN_QUERY_LENGTH);

  #debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    document.addEventListener('click', (event) => {
      if (this.showUserMenu()) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          this.closeUserMenu();
        }
      }
    });

  }

  ngOnDestroy() {
    if (this.#debounceTimer) clearTimeout(this.#debounceTimer);
  }

  onQueryChange(value: string) {
    const sanitized = value.slice(0, MAX_QUERY_LENGTH);
    this.query.set(sanitized);
    if (this.#debounceTimer) clearTimeout(this.#debounceTimer);
    const trimmedLength = sanitized.trim().length;
    if (trimmedLength >= MIN_QUERY_LENGTH) {
      this.#debounceTimer = setTimeout(() => this.searchNow(), 300);
    } else {
      this.isLoading.set(false);
      this.error.set(null);
      this.results.set([]);
    }
  }

  searchNow() {
    const q = this.query().trim();
    if (q.length < MIN_QUERY_LENGTH) {
      this.isLoading.set(false);
      this.error.set(null);
      this.results.set([]);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const params = new HttpParams().set('q', q);

    this.#http
      .get<{ success: boolean; data: PublicUser[] }>(`${environment.apiUrl}/users/search`, { params })
      .subscribe({
        next: (res) => {
          this.results.set(res.data ?? []);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message ?? 'Erreur lors de la recherche');
          this.results.set([]);
          this.isLoading.set(false);
        },
      });
  }

  displayName(u: PublicUser) {
    return `${u.firstName} ${u.lastName}`.trim();
  }

  initials(u: PublicUser) {
    const a = u.firstName?.[0] ?? '';
    const b = u.lastName?.[0] ?? '';
    return `${a}${b}`.toUpperCase() || '?';
  }

  toggleUserMenu(event?: Event) {
    if (event) event.stopPropagation();
    this.showUserMenu.set(!this.showUserMenu());
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
  }

  logout() {
    this.#authService.logout();
  }

  goToUser(id: string | undefined | null) {
    if (!id) return;
    this.#router.navigate(['/user', id]);
  }
}

