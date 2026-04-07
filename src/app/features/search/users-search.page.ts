import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NavbarComponent } from 'src/app/shared/navbar/navbar.component';

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
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <app-navbar activePage="search" />

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
  #http = inject(HttpClient);
  #router = inject(Router);

  query = signal('');
  results = signal<PublicUser[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  skeletons = computed(() => Array.from({ length: 6 }, (_, i) => i));
  readonly minQueryLength = MIN_QUERY_LENGTH;
  readonly maxQueryLength = MAX_QUERY_LENGTH;
  canSearch = computed(() => this.query().trim().length >= MIN_QUERY_LENGTH);

  #debounceTimer: ReturnType<typeof setTimeout> | null = null;

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

  goToUser(id: string | undefined | null) {
    if (!id) return;
    this.#router.navigate(['/user', id]);
  }
}
