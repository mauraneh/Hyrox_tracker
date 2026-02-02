import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-trainings-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <h1 class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide mb-6">Mes Entraînements</h1>
        <div class="card">
          <p class="text-hyrox-gray-400">Page entraînements en construction...</p>
          <a routerLink="/create-training" class="btn-primary mt-4">Créer un entraînement</a>
          <a routerLink="/dashboard" class="btn-primary mt-4">Retour au dashboard</a>
        </div>
      </div>
    </div>
  `,
})
export class TrainingsListPage {}
