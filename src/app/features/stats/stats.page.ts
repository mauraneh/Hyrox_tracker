import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';
import { forkJoin } from 'rxjs';
import { StatsOverview, ProgressionData, StationStats, RoxzoneStats } from 'src/app/core/types/interfaces';
import { StationsComparisonChartComponent } from 'src/app/shared/charts/stations-comparison-chart.component';
import { NavbarComponent } from 'src/app/shared/navbar/navbar.component';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [RouterLink, CommonModule, StationsComparisonChartComponent, NavbarComponent],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <app-navbar activePage="stats" />

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
              <tbody class="divide-y divide-hyrox-gray-700">
                @for (course of progression(); track course.id) {
                <tr class="bg-hyrox-gray-900 even:bg-hyrox-gray-800">
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

        <!-- Graphique de comparaison par station -->
        @if (stationStats() && getStationNames().length > 0) {
        <div class="card mb-8">
          <h2 class="text-xl font-bold text-white mb-2">Comparaison par station</h2>
          <p class="text-sm text-hyrox-gray-400 mb-6">
            Temps par station —
            <span class="inline-block w-3 h-3 rounded-sm bg-green-500 align-middle mx-1"></span>Meilleur ·
            <span class="inline-block w-3 h-3 rounded-sm bg-blue-500 align-middle mx-1"></span>Moyenne ·
            <span class="inline-block w-3 h-3 rounded-sm bg-hyrox-yellow align-middle mx-1"></span>Dernier
          </p>
          <app-stations-comparison-chart [stats]="stationStats()"></app-stations-comparison-chart>
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

  overview = signal<StatsOverview | null>(null);
  progression = signal<ProgressionData[]>([]);
  stationStats = signal<Record<string, StationStats> | null>(null);
  roxzoneStats = signal<RoxzoneStats | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);

    // Charger les statistiques en parallèle
    forkJoin({
      overview: this.#http.get<{ success: boolean; data: StatsOverview }>(`${environment.apiUrl}/stats/overview`),
      progression: this.#http.get<{ success: boolean; data: ProgressionData[] }>(`${environment.apiUrl}/stats/progression`),
      stations: this.#http.get<{ success: boolean; data: Record<string, StationStats> }>(`${environment.apiUrl}/stats/stations`),
      roxzone: this.#http.get<{ success: boolean; data: RoxzoneStats }>(`${environment.apiUrl}/stats/roxzone`)
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
    if (place === null || Number.isNaN(place)) return 0;
    return Math.round(place);
  }
}
