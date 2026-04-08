import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { StatsOverview } from 'src/app/core/types/interfaces';
import { NavbarComponent } from 'src/app/shared/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <app-navbar activePage="dashboard" />

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
  #http = inject(HttpClient);

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
