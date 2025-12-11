import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '@environments/environment';
import { forkJoin } from 'rxjs';
import { StatsOverview, ProgressionData, StationStats } from '@core/types/interfaces';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <nav class="bg-hyrox-gray-900 border-b border-hyrox-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-8">
              <h1 class="hyrox-title">Hyrox Tracker</h1>
              <nav class="hidden md:flex space-x-4">
                <a routerLink="/dashboard" class="text-hyrox-gray-400 hover:text-white">Dashboard</a>
                <a routerLink="/courses" class="text-hyrox-gray-400 hover:text-white">Courses</a>
                <a routerLink="/trainings" class="text-hyrox-gray-400 hover:text-white">Entraînements</a>
                <a routerLink="/stats" class="text-primary-500 font-medium">Statistiques</a>
              </nav>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Menu utilisateur -->
              <div class="relative user-menu-container">
                <button (click)="toggleUserMenu($event)" class="flex items-center space-x-2 text-sm text-hyrox-gray-400 hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer font-medium transition-colors bg-transparent border-none p-2 rounded-lg hover:bg-hyrox-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                @if (showUserMenu()) {
                <div (click)="$event.stopPropagation()" class="absolute right-0 mt-2 w-48 bg-hyrox-gray-900 rounded-lg shadow-lg border border-hyrox-gray-700 py-1 z-50">
                  <a routerLink="/profile" (click)="closeUserMenu()" class="block px-4 py-2 text-sm text-white hover:bg-hyrox-gray-800">
                    <div class="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profil</span>
                    </div>
                  </a>
                  <a routerLink="/settings" (click)="closeUserMenu()" class="block px-4 py-2 text-sm text-white hover:bg-hyrox-gray-800">
                    <div class="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Paramètres</span>
                    </div>
                  </a>
                  <div class="border-t border-hyrox-gray-700 my-1"></div>
                  <button (click)="logout(); closeUserMenu()" class="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300">
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
        <h1 class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide mb-8">Statistiques</h1>

        @if (isLoading()) {
        <div class="text-center py-12">
          <p class="text-hyrox-gray-400">Chargement des statistiques...</p>
        </div>
        } @else {
        <!-- Vue d'ensemble -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <h3 class="text-sm font-medium text-hyrox-gray-400 mb-2">Total Courses</h3>
            <p class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide">{{ overview()?.totalCourses || 0 }}</p>
          </div>

          <div class="card">
            <h3 class="text-sm font-medium text-hyrox-gray-400 mb-2">Meilleur Temps</h3>
            <p class="text-3xl font-bold text-primary-500">
              {{ overview()?.bestTime ? formatTime(overview()!.bestTime!) : '--:--' }}
            </p>
          </div>

          <div class="card">
            <h3 class="text-sm font-medium text-hyrox-gray-400 mb-2">Temps Moyen</h3>
            <p class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide">
              {{ overview()?.averageTime ? formatTime(overview()!.averageTime!) : '--:--' }}
            </p>
          </div>

        <div class="card">
            <h3 class="text-sm font-medium text-hyrox-gray-400 mb-2">Dernier Temps</h3>
            <p class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide">
              {{ overview()?.latestTime ? formatTime(overview()!.latestTime!) : '--:--' }}
            </p>
          </div>
        </div>

        @if (overview()?.improvement !== null && overview()!.improvement! !== 0) {
        <div class="card mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white mb-2">Évolution</h3>
              <p class="text-sm text-hyrox-gray-400">
                @if (overview()!.improvement! > 0) {
                <span class="text-red-400">+{{ overview()!.improvement!.toFixed(1) }}%</span>
                <span> par rapport à votre meilleur temps</span>
                } @else {
                <span class="text-green-600 dark:text-green-400">{{ overview()!.improvement!.toFixed(1) }}%</span>
                <span> d'amélioration par rapport à votre meilleur temps</span>
                }
              </p>
            </div>
          </div>
        </div>
        }

        <!-- Graphique de progression -->
        @if (progression().length > 0) {
        <div class="card mb-8">
          <h2 class="text-xl font-bold text-white mb-6">Progression dans le temps</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
              <thead class="bg-dark-50 dark:bg-hyrox-gray-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-hyrox-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-hyrox-gray-500 uppercase tracking-wider">Course</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-hyrox-gray-500 uppercase tracking-wider">Temps</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-hyrox-gray-500 uppercase tracking-wider">Catégorie</th>
                </tr>
              </thead>
              <tbody class="bg-hyrox-gray-900 divide-y divide-dark-200 dark:divide-dark-700">
                @for (course of progression(); track course.id) {
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {{ formatDate(course.date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {{ course.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-500">
                    {{ formatTime(course.totalTime) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-hyrox-gray-400">
                    {{ course.category }}
                  </td>
                </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        }

        <!-- Statistiques par station -->
        @if (stationStats() && getStationNames().length > 0) {
        <div class="card mb-8">
          <h2 class="text-xl font-bold text-white mb-6">Statistiques par station</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (station of getStationNames(); track station) {
            @if (stationStats()![station]) {
            <div class="p-4 bg-dark-50 dark:bg-hyrox-gray-800 rounded-lg">
              <h3 class="text-sm font-semibold text-white mb-3 capitalize">
                {{ formatStationName(station) }}
              </h3>
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Meilleur:</span>
                  <span class="font-medium text-green-600 dark:text-green-400">
                    {{ formatTime(stationStats()![station].best) }}
                  </span>
                </div>
                @if (stationStats()![station].bestPlace !== null) {
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Meilleure place:</span>
                  <span class="font-medium text-green-600 dark:text-green-400">
                    #{{ stationStats()![station].bestPlace }}
                  </span>
                </div>
                }
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Moyenne:</span>
                  <span class="font-medium text-white">
                    {{ formatTime(stationStats()![station].average) }}
                  </span>
                </div>
                @if (stationStats()![station].averagePlace !== null) {
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Place moyenne:</span>
                  <span class="font-medium text-white">
                    #{{ roundPlace(stationStats()![station].averagePlace!) }}
                  </span>
                </div>
                }
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Dernier:</span>
                  <span class="font-medium text-primary-500">
                    {{ formatTime(stationStats()![station].latest) }}
                  </span>
                </div>
              </div>
            </div>
            }
            }
          </div>
        </div>
        }

        <!-- Statistiques Roxzone, Run Total, Best Run Lap -->
        @if (roxzoneStats()) {
        <div class="card mb-8">
          <h2 class="text-xl font-bold text-white mb-6">Statistiques Roxzone & Runs</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Roxzone Time -->
            @if (roxzoneStats()!.roxzoneTime.best !== null) {
            <div class="p-4 bg-dark-50 dark:bg-hyrox-gray-800 rounded-lg">
              <h3 class="text-sm font-semibold text-white mb-3">Roxzone Time</h3>
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Meilleur:</span>
                  <span class="font-medium text-green-600 dark:text-green-400">
                    {{ formatTime(roxzoneStats()!.roxzoneTime.best!) }}
                  </span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Moyenne:</span>
                  <span class="font-medium text-white">
                    {{ formatTime(roxzoneStats()!.roxzoneTime.average!) }}
                  </span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Dernier:</span>
                  <span class="font-medium text-primary-500">
                    {{ formatTime(roxzoneStats()!.roxzoneTime.latest!) }}
                  </span>
                </div>
              </div>
            </div>
            }

            <!-- Run Total -->
            @if (roxzoneStats()!.runTotal.best !== null) {
            <div class="p-4 bg-dark-50 dark:bg-hyrox-gray-800 rounded-lg">
              <h3 class="text-sm font-semibold text-white mb-3">Run Total</h3>
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Meilleur:</span>
                  <span class="font-medium text-green-600 dark:text-green-400">
                    {{ formatTime(roxzoneStats()!.runTotal.best!) }}
                  </span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Moyenne:</span>
                  <span class="font-medium text-white">
                    {{ formatTime(roxzoneStats()!.runTotal.average!) }}
                  </span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Dernier:</span>
                  <span class="font-medium text-primary-500">
                    {{ formatTime(roxzoneStats()!.runTotal.latest!) }}
                  </span>
                </div>
              </div>
            </div>
            }

            <!-- Best Run Lap -->
            @if (roxzoneStats()!.bestRunLap.best !== null) {
            <div class="p-4 bg-dark-50 dark:bg-hyrox-gray-800 rounded-lg">
              <h3 class="text-sm font-semibold text-white mb-3">Best Run Lap</h3>
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Meilleur:</span>
                  <span class="font-medium text-green-600 dark:text-green-400">
                    {{ formatTime(roxzoneStats()!.bestRunLap.best!) }}
                  </span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Moyenne:</span>
                  <span class="font-medium text-white">
                    {{ formatTime(roxzoneStats()!.bestRunLap.average!) }}
                  </span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-hyrox-gray-400">Dernier:</span>
                  <span class="font-medium text-primary-500">
                    {{ formatTime(roxzoneStats()!.bestRunLap.latest!) }}
                  </span>
                </div>
              </div>
            </div>
            }
          </div>
        </div>
        }

        @if (overview()?.totalCourses === 0) {
        <div class="card text-center py-12">
          <p class="text-hyrox-gray-400 mb-4">Aucune course enregistrée pour le moment.</p>
          <a routerLink="/courses/new" class="btn-primary">Ajouter une course</a>
      </div>
        }
        }
      </main>
    </div>
  `,
})
export class StatsPage implements OnInit {
  #authService = inject(AuthService);
  #http = inject(HttpClient);

  currentUser = this.#authService.currentUser;
  overview = signal<StatsOverview | null>(null);
  progression = signal<ProgressionData[]>([]);
  stationStats = signal<Record<string, StationStats> | null>(null);
  roxzoneStats = signal<any>(null);
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

  loadStats() {
    this.isLoading.set(true);

    // Charger les statistiques en parallèle
    forkJoin({
      overview: this.#http.get<{ success: boolean; data: StatsOverview }>(`${environment.apiUrl}/stats/overview`),
      progression: this.#http.get<{ success: boolean; data: ProgressionData[] }>(`${environment.apiUrl}/stats/progression`),
      stations: this.#http.get<{ success: boolean; data: Record<string, StationStats> }>(`${environment.apiUrl}/stats/stations`),
      roxzone: this.#http.get<{ success: boolean; data: any }>(`${environment.apiUrl}/stats/roxzone`),
    }).subscribe({
      next: (responses) => {
        if (responses.overview.success) {
          this.overview.set(responses.overview.data);
        }
        if (responses.progression.success) {
          this.progression.set(responses.progression.data);
        }
        if (responses.stations.success) {
          this.stationStats.set(responses.stations.data);
        }
        if (responses.roxzone.success) {
          this.roxzoneStats.set(responses.roxzone.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
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
      month: 'short',
      year: 'numeric',
    });
  }

  formatStationName(station: string): string {
    const names: Record<string, string> = {
      run1: 'Run 1',
      run2: 'Run 2',
      run3: 'Run 3',
      run4: 'Run 4',
      run5: 'Run 5',
      run6: 'Run 6',
      run7: 'Run 7',
      run8: 'Run 8',
      skiErg: 'Ski Erg',
      sledPush: 'Sled Push',
      sledPull: 'Sled Pull',
      burpeeBroadJump: 'Burpee Broad Jump',
      row: 'Row Erg',
      farmerCarry: 'Farmer Carry',
      sandbagLunges: 'Sandbag Lunges',
      wallBalls: 'Wall Balls',
    };
    return names[station] || station;
  }

  getStationNames(): string[] {
    const stats = this.stationStats();
    if (!stats) return [];
    return Object.keys(stats);
  }

  roundPlace(place: number | null): number {
    if (place === null) return 0;
    return Math.round(place);
  }
}
