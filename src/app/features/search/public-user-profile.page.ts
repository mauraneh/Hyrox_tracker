import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';

type RecentCourse = {
  id: string;
  name: string;
  city: string;
  date: string;
  totalTime: number;
  category: string;
};

type PublicProfileResponse = {
  success: boolean;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
      category: string | null;
    };
    stats: {
      totalCourses: number;
      totalDistanceKm: number;
      totalTimeSeconds: number;
      personalBestSeconds: number | null;
    };
    recentCourses: RecentCourse[];
  };
};

@Component({
  selector: 'app-public-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <nav class="bg-hyrox-gray-900 border-b border-hyrox-gray-800 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-20">
            <div class="flex items-center space-x-8 min-w-0">
              <h1 class="hyrox-title">Hyrox Tracker</h1>
              <nav class="hidden md:flex space-x-6">
                <a routerLink="/dashboard" class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors">Dashboard</a>
                <a routerLink="/search" class="text-hyrox-yellow font-bold text-sm uppercase tracking-wide hover:text-white transition-colors">Recherche</a>
              </nav>
            </div>
            <div class="flex items-center space-x-4">
              @if (displayName()) {
              <span class="hidden sm:inline text-sm font-semibold text-hyrox-yellow truncate max-w-[220px]">
                {{ displayName() }}
              </span>
              }
              <a
                routerLink="/search"
                class="p-2 rounded-lg text-hyrox-gray-400 hover:text-hyrox-yellow hover:bg-hyrox-gray-800 transition-colors"
                aria-label="Retour à la recherche"
                title="Retour à la recherche"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a routerLink="/search" class="inline-flex items-center gap-2 text-hyrox-yellow hover:text-white font-semibold mb-8 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour à la recherche
        </a>

        @if (isLoading()) {
        <div class="card animate-pulse">
          <div class="flex items-center gap-4">
            <div class="h-16 w-16 rounded-full bg-hyrox-gray-800"></div>
            <div class="flex-1">
              <div class="h-5 bg-hyrox-gray-800 rounded w-1/2 mb-2"></div>
              <div class="h-4 bg-hyrox-gray-800 rounded w-1/3"></div>
            </div>
          </div>
        </div>
        } @else if (error()) {
        <div class="card border-red-500">
          <p class="text-red-400 text-sm">{{ error() }}</p>
        </div>
        } @else if (profile() === null) {
        <div class="card text-center py-12">
          <p class="text-hyrox-gray-400">Profil introuvable</p>
        </div>
        } @else {
        <div class="card mb-8">
          <div class="flex items-center gap-4">
            <div class="h-16 w-16 rounded-full overflow-hidden bg-hyrox-gray-800 flex items-center justify-center">
              @if (profile()!.user.avatar) {
              <img [src]="profile()!.user.avatar!" [alt]="displayName()" class="h-full w-full object-cover" />
              } @else {
              <span class="text-hyrox-yellow font-black text-xl">{{ initials() }}</span>
              }
            </div>
            <div class="min-w-0">
              <h1 class="text-3xl font-black text-hyrox-yellow uppercase tracking-wide truncate">
                {{ displayName() }}
              </h1>
              @if (profile()!.user.category) {
              <p class="text-hyrox-gray-400">{{ profile()!.user.category }}</p>
              }
              <p class="text-xs text-hyrox-gray-500 mt-1">Profil public</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="card border-hyrox-yellow/20">
            <p class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-2">Courses</p>
            <p class="text-4xl font-black text-hyrox-yellow">{{ profile()!.stats.totalCourses }}</p>
          </div>
          <div class="card border-hyrox-yellow/20">
            <p class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-2">Distance totale</p>
            <p class="text-4xl font-black text-white">{{ profile()!.stats.totalDistanceKm }} km</p>
            <p class="text-xs text-hyrox-gray-500 mt-1">Estimation Hyrox (8 km / course)</p>
          </div>
          <div class="card border-hyrox-yellow/20">
            <p class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-2">Temps total</p>
            <p class="text-3xl font-black text-hyrox-yellow">{{ formatTime(profile()!.stats.totalTimeSeconds) }}</p>
          </div>
          <div class="card border-hyrox-yellow/20">
            <p class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-2">Record (meilleur temps)</p>
            <p class="text-3xl font-black text-white">
              {{ profile()!.stats.personalBestSeconds !== null ? formatTime(profile()!.stats.personalBestSeconds!) : '--:--' }}
            </p>
          </div>
        </div>

        <div class="card">
          <h2 class="text-xl font-bold text-white mb-6">Dernières courses</h2>
          @if (profile()!.recentCourses.length === 0) {
          <p class="text-hyrox-gray-400">Aucune course.</p>
          } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-hyrox-gray-700">
              <thead class="bg-hyrox-gray-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-hyrox-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-hyrox-gray-500 uppercase tracking-wider">Course</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-hyrox-gray-500 uppercase tracking-wider">Ville</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-hyrox-gray-500 uppercase tracking-wider">Temps</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-hyrox-gray-700">
                @for (c of profile()!.recentCourses; track c.id) {
                <tr class="bg-hyrox-gray-900 even:bg-hyrox-gray-800">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ formatDate(c.date) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ c.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-hyrox-gray-400">{{ c.city }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-500">{{ formatTime(c.totalTime) }}</td>
                </tr>
                }
              </tbody>
            </table>
          </div>
          }
        </div>
        }
      </main>
    </div>
  `,
})
export class PublicUserProfilePage {
  #http = inject(HttpClient);
  #route = inject(ActivatedRoute);

  isLoading = signal(true);
  error = signal<string | null>(null);
  profile = signal<PublicProfileResponse['data'] | null>(null);

  constructor() {
    // Recharge le profil à chaque changement de :id
    this.#route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.profile.set(null);
        this.isLoading.set(false);
        this.error.set('Utilisateur invalide');
        return;
      }
      this.loadProfile(id);
    });
  }

  private loadProfile(id: string) {
    this.isLoading.set(true);
    this.error.set(null);
    this.profile.set(null);

    this.#http.get<PublicProfileResponse>(`${environment.apiUrl}/users/public/${id}`).subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Profil introuvable ou privé');
        this.isLoading.set(false);
      },
    });
  }

  displayName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return `${p.user.firstName} ${p.user.lastName}`.trim();
  });

  initials = computed(() => {
    const p = this.profile();
    if (!p) return '?';
    const a = p.user.firstName?.[0] ?? '';
    const b = p.user.lastName?.[0] ?? '';
    return `${a}${b}`.toUpperCase() || '?';
  });

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}

