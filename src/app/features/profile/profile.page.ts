import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Goal, User } from 'src/app/core/types/interfaces';

const SEGMENTS = [
  { key: 'run1', label: 'Run 1' },
  { key: 'skiErg', label: '1000m SkiErg' },
  { key: 'run2', label: 'Run 2' },
  { key: 'sledPush', label: '50m Sled Push' },
  { key: 'run3', label: 'Run 3' },
  { key: 'sledPull', label: '50m Sled Pull' },
  { key: 'run4', label: 'Run 4' },
  { key: 'burpeeBroadJump', label: '80m Burpee Broad Jump' },
  { key: 'run5', label: 'Run 5' },
  { key: 'row', label: '1000m Row' },
  { key: 'run6', label: 'Run 6' },
  { key: 'farmerCarry', label: '200m Farmers Carry' },
  { key: 'run7', label: 'Run 7' },
  { key: 'sandbagLunges', label: '100m Sandbag Lunges' },
  { key: 'run8', label: 'Run 8' },
  { key: 'wallBalls', label: 'Wall Balls' },
];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
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
                  <button (click)="logout(); closeUserMenu()" class="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors">
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

      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-4xl font-black text-hyrox-yellow mb-8 uppercase tracking-wide">Profil</h1>

        <!-- Profil utilisateur -->
        <div class="card mb-8">
          <h2 class="text-xl font-bold text-white mb-6">Profil utilisateur</h2>

          @if (profileError()) {
          <div class="mb-4 p-4 bg-red-900/30 border-2 border-red-500 text-red-300 rounded-lg text-sm">
            {{ profileError() }}
          </div>
          }

          @if (profileSuccess()) {
          <div class="mb-4 p-4 bg-green-900/30 border-2 border-green-500 text-green-300 rounded-lg text-sm">
            {{ profileSuccess() }}
          </div>
          }

          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label" for="firstName">Prénom</label>
                <input type="text" id="firstName" class="input" formControlName="firstName" />
                @if (profileForm.controls['firstName'].invalid && profileForm.controls['firstName'].touched) {
                <p class="mt-1 text-sm text-red-400">Prénom requis (2-50 caractères)</p>
                }
              </div>

              <div>
                <label class="label" for="lastName">Nom</label>
                <input type="text" id="lastName" class="input" formControlName="lastName" />
                @if (profileForm.controls['lastName'].invalid && profileForm.controls['lastName'].touched) {
                <p class="mt-1 text-sm text-red-400">Nom requis (2-50 caractères)</p>
                }
              </div>

              <div>
                <label class="label" for="category">Catégorie Hyrox</label>
                <select id="category" class="input" formControlName="category">
                  <option value="">Sélectionner une catégorie</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Men Pro">Men Pro</option>
                  <option value="Women Pro">Women Pro</option>
                  <option value="Men Doubles">Men Doubles</option>
                  <option value="Women Doubles">Women Doubles</option>
                  <option value="Mixed Doubles">Mixed Doubles</option>
                </select>
              </div>

              <div>
                <label class="label" for="weight">Poids (kg)</label>
                <input type="number" id="weight" class="input" formControlName="weight" step="0.1" min="0" />
              </div>

              <div>
                <label class="label" for="height">Taille (cm)</label>
                <input type="number" id="height" class="input" formControlName="height" step="1" min="0" />
              </div>
            </div>

            <div class="mt-6">
              <button type="submit" class="btn-primary" [disabled]="profileForm.invalid || isUpdatingProfile()">
                @if (isUpdatingProfile()) {
                <span>Enregistrement...</span>
                } @else {
                <span>Enregistrer les modifications</span>
                }
              </button>
            </div>
          </form>
        </div>

        <!-- Import de résultats -->
        <div class="card mb-8">
          <h2 class="text-xl font-bold text-white mb-6">Import de résultats Hyrox</h2>
          <p class="text-sm text-hyrox-gray-400 mb-6">
            Importez vos résultats depuis <a href="https://results.hyrox.com/" target="_blank" class="text-hyrox-yellow hover:text-white underline font-semibold">results.hyrox.com</a> ou <a href="https://www.hyresult.com/" target="_blank" class="text-hyrox-yellow hover:text-white underline font-semibold">hyresult.com</a>
          </p>

          @if (importError()) {
          <div class="mb-4 p-4 bg-red-900/30 border-2 border-red-500 text-red-300 rounded-lg text-sm">
            {{ importError() }}
          </div>
          }

          @if (importSuccess()) {
          <div class="mb-4 p-4 bg-green-900/30 border-2 border-green-500 text-green-300 rounded-lg text-sm">
            {{ importSuccess() }}
          </div>
          }

          <!-- Recherche par nom -->
          <div class="mb-6 p-4 bg-hyrox-gray-800 rounded-lg border border-hyrox-gray-700">
            <h3 class="text-lg font-semibold text-white mb-4">Rechercher mes résultats</h3>
            <p class="text-sm text-hyrox-gray-400 mb-4">
              Ouvrez results.hyrox.com ou hyresult.com avec votre nom pré-rempli pour rechercher manuellement
            </p>
            <div class="flex gap-4">
              <button (click)="searchOnHyrox()" class="btn-outline">
                Ouvrir results.hyrox.com
              </button>
              <button (click)="searchOnHyResult()" class="btn-outline">
                Ouvrir hyresult.com
              </button>
            </div>
          </div>

          <!-- Import CSV -->
          <div class="mb-6 p-4 bg-hyrox-gray-800 rounded-lg border border-hyrox-gray-700">
            <h3 class="text-lg font-semibold text-white mb-4">Importer depuis CSV</h3>
            <p class="text-sm text-hyrox-gray-400 mb-4">
              Exportez vos résultats depuis results.hyrox.com en CSV, puis importez-les ici
            </p>
            <div>
              <label class="label" for="csvFile">Fichier CSV</label>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                (change)="onFileSelected($event)"
                class="input"
              />
              <p class="mt-1 text-xs text-hyrox-gray-500">
                Format accepté : CSV exporté depuis results.hyrox.com
              </p>
              @if (selectedFile()) {
              <div class="mt-2 flex items-center justify-between p-2 bg-hyrox-gray-900 rounded border border-hyrox-gray-700">
                <span class="text-sm text-hyrox-gray-300">{{ selectedFile()?.name }}</span>
                <button (click)="importCsv()" class="btn-primary text-sm" [disabled]="isImportingCsv()">
                  @if (isImportingCsv()) {
                  <span>Import en cours...</span>
                  } @else {
                  <span>Importer</span>
                  }
                </button>
              </div>
              }
            </div>
          </div>

          <!-- Import manuel -->
          <div class="p-4 bg-hyrox-gray-800 rounded-lg border border-hyrox-gray-700">
            <h3 class="text-lg font-semibold text-white mb-4">Import manuel</h3>
            <p class="text-sm text-hyrox-gray-400 mb-4">
              Collez le lien vers votre résultat ou entrez les informations manuellement
            </p>
            <form [formGroup]="importForm" (ngSubmit)="importManually()">
              <div class="space-y-4">
                <div>
                  <label class="label" for="sourceUrl">Lien vers le résultat (optionnel)</label>
                  <input
                    type="url"
                    id="sourceUrl"
                    class="input"
                    formControlName="sourceUrl"
                    placeholder="https://results.hyrox.com/race/123"
                  />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="label" for="importName">Nom de la course</label>
                    <input type="text" id="importName" class="input" formControlName="name" placeholder="Hyrox Paris 2024" />
                  </div>
                  <div>
                    <label class="label" for="importCity">Ville</label>
                    <input type="text" id="importCity" class="input" formControlName="city" placeholder="Paris" />
                  </div>
                  <div>
                    <label class="label" for="importDate">Date</label>
                    <input type="date" id="importDate" class="input" formControlName="date" />
                  </div>
                  <div>
                    <label class="label" for="importCategory">Catégorie</label>
                    <select id="importCategory" class="input" formControlName="category">
                      <option value="">Sélectionner...</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Men Pro">Men Pro</option>
                      <option value="Women Pro">Women Pro</option>
                    </select>
                  </div>
                  <div>
                    <label class="label" for="importTime">Temps total (H:MM:SS)</label>
                    <input type="text" id="importTime" class="input" formControlName="totalTime" placeholder="1:30:00" />
                    <p class="mt-1 text-xs text-hyrox-gray-500">Format: H:MM:SS</p>
                  </div>
                </div>

                <!-- Statistiques globales optionnelles -->
                <div class="mt-4 pt-4 border-t border-hyrox-gray-700">
                  <h3 class="text-sm font-semibold text-white mb-3">Statistiques globales (optionnel)</h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label class="label text-xs" for="importRoxzoneTime">Roxzone Time (H:MM:SS)</label>
                      <input type="text" id="importRoxzoneTime" class="input" formControlName="roxzoneTime" placeholder="0:05:47" />
                    </div>

                    <div>
                      <label class="label text-xs" for="importRunTotal">Run Total (H:MM:SS)</label>
                      <input type="text" id="importRunTotal" class="input" formControlName="runTotal" placeholder="0:44:07" />
                    </div>

                    <div>
                      <label class="label text-xs" for="importBestRunLap">Best Run Lap (MM:SS)</label>
                      <input type="text" id="importBestRunLap" class="input" formControlName="bestRunLap" placeholder="5:28" />
                    </div>
                  </div>
                </div>

                <!-- Segments -->
                <div class="mt-4 pt-4 border-t border-hyrox-gray-700">
                  <h3 class="text-sm font-semibold text-white mb-3">Temps par segment (optionnel)</h3>
                  <p class="text-xs text-hyrox-gray-400 mb-4">
                    Renseignez les temps et positions pour chaque segment
                  </p>
                  <div class="space-y-2 max-h-96 overflow-y-auto">
                    @for (segment of SEGMENTS; track segment.key; let i = $index) {
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-2 p-2 bg-hyrox-gray-800 rounded text-sm border border-hyrox-gray-700">
                      <div class="md:col-span-1 flex items-center">
                        <label class="text-xs font-medium text-white" for="import-segment-time-{{i}}">{{ segment.label }}</label>
                      </div>
                      <div>
                        <label class="text-xs text-hyrox-gray-400" for="import-segment-time-{{i}}">Temps (MM:SS)</label>
                        <input
                          id="import-segment-time-{{i}}"
                          type="text"
                          class="input text-xs py-1"
                          [formControl]="getSegmentControl(i, 'time')"
                          placeholder="5:28"
                        />
                      </div>
                      <div>
                        <label class="text-xs text-hyrox-gray-400" for="import-segment-place-{{i}}">Position</label>
                        <input
                          id="import-segment-place-{{i}}"
                          type="number"
                          class="input text-xs py-1"
                          [formControl]="getSegmentControl(i, 'place')"
                          placeholder="182"
                          min="1"
                        />
                      </div>
                    </div>
                    }
                  </div>
                </div>

                <button type="submit" class="btn-primary" [disabled]="importForm.invalid || isImportingManual()">
                  @if (isImportingManual()) {
                  <span>Import en cours...</span>
                  } @else {
                  <span>Importer</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Objectifs personnels -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">Objectifs personnels</h2>
            <button (click)="showGoalForm.set(true)" class="btn-primary text-sm" [disabled]="showGoalForm()">
              + Ajouter un objectif
            </button>
          </div>

          @if (goalsError()) {
          <div class="mb-4 p-4 bg-red-900/30 border-2 border-red-500 text-red-300 rounded-lg text-sm">
            {{ goalsError() }}
          </div>
          }

          <!-- Formulaire d'ajout/modification d'objectif -->
          @if (showGoalForm()) {
          <div class="mb-6 p-4 bg-hyrox-gray-800 rounded-lg border border-hyrox-gray-700">
            <h3 class="text-lg font-semibold text-white mb-4">
              {{ editingGoal() ? "Modifier l'objectif" : 'Nouvel objectif' }}
            </h3>
            <form [formGroup]="goalForm" (ngSubmit)="saveGoal()">
              <div class="space-y-4">
                <div>
                  <label class="label" for="goalTitle">Titre de l'objectif</label>
                  <input type="text" id="goalTitle" class="input" formControlName="title" placeholder="Ex: Passer sous 1h25" />
                  @if (goalForm.controls['title'].invalid && goalForm.controls['title'].touched) {
                  <p class="mt-1 text-sm text-red-400">Titre requis (3-100 caractères)</p>
                  }
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="label" for="targetTime">Temps cible (heures:minutes:secondes)</label>
                    <input type="text" id="targetTime" class="input" formControlName="targetTime" placeholder="1:25:00" />
                    <p class="mt-1 text-xs text-hyrox-gray-500">Format: H:MM:SS</p>
                  </div>

                  <div>
                    <label class="label" for="targetDate">Date cible</label>
                    <input type="date" id="targetDate" class="input" formControlName="targetDate" />
                  </div>
                </div>

                <div class="flex space-x-4">
                  <button type="submit" class="btn-primary" [disabled]="goalForm.invalid || isSavingGoal()">
                    @if (isSavingGoal()) {
                    <span>Enregistrement...</span>
                    } @else {
                    <span>{{ editingGoal() ? 'Modifier' : 'Créer' }}</span>
                    }
                  </button>
                  <button type="button" (click)="cancelGoalForm()" class="btn-outline">Annuler</button>
                </div>
              </div>
            </form>
          </div>
          }

          <!-- Liste des objectifs -->
          @if (isLoadingGoals()) {
          <p class="text-hyrox-gray-400">Chargement des objectifs...</p>
          } @else if (goals().length === 0) {
          <p class="text-hyrox-gray-400">Aucun objectif défini pour le moment.</p>
          } @else {
          <div class="space-y-4">
            @for (goal of goals(); track goal.id) {
            <div class="p-4 border border-hyrox-gray-700 rounded-lg" [ngClass]="{'bg-green-900/20 border-green-500/50': goal.achieved}">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h3 class="text-lg font-semibold text-white">{{ goal.title }}</h3>
                    @if (goal.achieved) {
                    <span class="px-2 py-1 text-xs font-medium bg-green-900/30 text-green-300 rounded border border-green-500/50">
                      Atteint
                    </span>
                    }
                  </div>
                  @if (goal.targetTime) {
                  <p class="text-sm text-hyrox-gray-400 mb-1">
                    Temps cible: {{ formatTime(goal.targetTime) }}
                  </p>
                  }
                  @if (goal.targetDate) {
                  <p class="text-sm text-hyrox-gray-400 mb-1">
                    Date cible: {{ formatDate(goal.targetDate) }}
                  </p>
                  }
                  @if (goal.achieved && goal.achievedAt) {
                  <p class="text-sm text-green-300">
                    Atteint le: {{ formatDate(goal.achievedAt) }}
                  </p>
                  }
                </div>
                <div class="flex space-x-2">
                  @if (!goal.achieved) {
                  <button (click)="markAsAchieved(goal.id)" class="btn-outline text-sm">Marquer comme atteint</button>
                  }
                  <button (click)="editGoal(goal)" class="btn-outline text-sm">Modifier</button>
                  <button (click)="deleteGoal(goal.id)" class="btn-outline text-sm text-red-400 hover:text-red-300">Supprimer</button>
                </div>
              </div>
            </div>
            }
          </div>
          }
        </div>
      </main>
    </div>
  `,
})
export class ProfilePage implements OnInit {
  #authService = inject(AuthService);
  #http = inject(HttpClient);
  #fb = inject(FormBuilder);

  currentUser = this.#authService.currentUser;
  isUpdatingProfile = signal(false);
  profileError = signal<string | null>(null);
  profileSuccess = signal<string | null>(null);
  showUserMenu = signal(false);

  goals = signal<Goal[]>([]);
  isLoadingGoals = signal(false);
  goalsError = signal<string | null>(null);
  showGoalForm = signal(false);
  editingGoal = signal<Goal | null>(null);
  isSavingGoal = signal(false);

  // Import de résultats
  importError = signal<string | null>(null);
  importSuccess = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  isImportingCsv = signal(false);
  isImportingManual = signal(false);

  profileForm = this.#fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    category: [''],
    weight: [null as number | null],
    height: [null as number | null],
  });

  goalForm = this.#fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    targetTime: [''],
    targetDate: [''],
  });

  importForm = this.#fb.group({
    sourceUrl: [''],
    name: ['', [Validators.required]],
    city: ['', [Validators.required]],
    date: ['', [Validators.required]],
    category: ['', [Validators.required]],
    totalTime: ['', [Validators.required]],
    roxzoneTime: [''],
    runTotal: [''],
    bestRunLap: [''],
    segments: this.#fb.array(
      SEGMENTS.map(() =>
        this.#fb.group({
          time: [''],
          place: [''],
        }),
      ),
    ),
  });

  SEGMENTS = SEGMENTS;

  getSegmentControl(index: number, field: 'time' | 'place'): FormControl {
    const segmentsArray = this.importForm.get('segments') as FormArray;
    return segmentsArray.at(index).get(field) as FormControl;
  }

  ngOnInit() {
    // Fermer le menu si on clique en dehors
    document.addEventListener('click', (event) => {
      if (this.showUserMenu()) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          this.closeUserMenu();
        }
      }
    });

    this.loadUserProfile();
    this.loadGoals();
  }

  loadUserProfile() {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        category: user.category || '',
        weight: user.weight || null,
        height: user.height || null,
      });
    }
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    this.isUpdatingProfile.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);

    const user = this.currentUser();
    if (!user) return;

    const formValue = this.profileForm.value;
    this.#http
      .put<{ success: boolean; data: User; message: string }>(`${environment.apiUrl}/users/${user.id}`, {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        category: formValue.category || null,
        weight: formValue.weight ? Number(formValue.weight) : null,
        height: formValue.height ? Number(formValue.height) : null,
      })
      .subscribe({
        next: () => {
          this.profileSuccess.set('Profil mis à jour avec succès');
          this.#authService.loadCurrentUser();
          this.isUpdatingProfile.set(false);
        },
        error: (error) => {
          this.profileError.set(error.error?.message || 'Erreur lors de la mise à jour du profil');
          this.isUpdatingProfile.set(false);
        },
      });
  }

  loadGoals() {
    this.isLoadingGoals.set(true);
    this.goalsError.set(null);

    this.#http.get<{ success: boolean; data: Goal[] }>(`${environment.apiUrl}/goals`).subscribe({
      next: (response) => {
        this.goals.set(response.data);
        this.isLoadingGoals.set(false);
      },
      error: (error) => {
        this.goalsError.set(error.error?.message || 'Erreur lors du chargement des objectifs');
        this.isLoadingGoals.set(false);
      },
    });
  }

  saveGoal() {
    if (this.goalForm.invalid) return;

    this.isSavingGoal.set(true);
    const formValue = this.goalForm.value;
    const targetTime = formValue.targetTime ? this.parseTimeToSeconds(formValue.targetTime) : null;

    const goalData = {
      title: formValue.title!,
      targetTime: targetTime,
      targetDate: formValue.targetDate || null,
    };

    const goalId = this.editingGoal()?.id;
    const request = goalId
      ? this.#http.put<{ success: boolean; data: Goal; message: string }>(`${environment.apiUrl}/goals/${goalId}`, goalData)
      : this.#http.post<{ success: boolean; data: Goal; message: string }>(`${environment.apiUrl}/goals`, goalData);

    request.subscribe({
      next: () => {
        this.loadGoals();
        this.cancelGoalForm();
        this.isSavingGoal.set(false);
      },
      error: (error) => {
        this.goalsError.set(error.error?.message || 'Erreur lors de l\'enregistrement de l\'objectif');
        this.isSavingGoal.set(false);
      },
    });
  }

  editGoal(goal: Goal) {
    this.editingGoal.set(goal);
    this.goalForm.patchValue({
      title: goal.title,
      targetTime: goal.targetTime ? this.formatTime(goal.targetTime) : '',
      targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
    });
    this.showGoalForm.set(true);
  }

  deleteGoal(goalId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) return;

    this.#http.delete<{ success: boolean; message: string }>(`${environment.apiUrl}/goals/${goalId}`).subscribe({
      next: () => {
        this.loadGoals();
      },
      error: (error) => {
        this.goalsError.set(error.error?.message || 'Erreur lors de la suppression de l\'objectif');
      },
    });
  }

  markAsAchieved(goalId: string) {
    this.#http.patch<{ success: boolean; data: Goal; message: string }>(`${environment.apiUrl}/goals/${goalId}/achieve`, {}).subscribe({
      next: () => {
        this.loadGoals();
      },
      error: (error) => {
        this.goalsError.set(error.error?.message || 'Erreur lors de la mise à jour de l\'objectif');
      },
    });
  }

  cancelGoalForm() {
    this.showGoalForm.set(false);
    this.editingGoal.set(null);
    this.goalForm.reset();
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  parseTimeToSeconds(timeString: string): number {
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // Import de résultats
  searchOnHyrox() {
    const user = this.currentUser();
    if (user) {
      const firstName = encodeURIComponent(user.firstName);
      const lastName = encodeURIComponent(user.lastName);
      const url = `https://results.hyrox.com/?firstname=${firstName}&lastname=${lastName}`;
      window.open(url, '_blank');
    }
  }

  searchOnHyResult() {
    const user = this.currentUser();
    if (user) {
      const searchQuery = encodeURIComponent(`${user.firstName} ${user.lastName}`);
      const url = `https://www.hyresult.com/?s=${searchQuery}`;
      window.open(url, '_blank');
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.importError.set(null);
      this.importSuccess.set(null);
    }
  }

  importCsv() {
    const file = this.selectedFile();
    if (!file) return;

    this.isImportingCsv.set(true);
    this.importError.set(null);
    this.importSuccess.set(null);

    const formData = new FormData();
    formData.append('file', file);

    this.#http.post<{ success: boolean; data: unknown; message?: string }>(`${environment.apiUrl}/courses/import/csv`, formData).subscribe({
      next: (response) => {
        const importedCount = Array.isArray(response.data) ? response.data.length : 0;
        this.importSuccess.set(response.message || `${importedCount} course(s) importée(s) avec succès`);
        this.selectedFile.set(null);
        this.isImportingCsv.set(false);
        // Réinitialiser l'input file
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (error) => {
        this.importError.set(error.error?.message || 'Erreur lors de l\'import du fichier CSV');
        this.isImportingCsv.set(false);
      },
    });
  }

  importManually() {
    if (this.importForm.invalid) return;

    this.isImportingManual.set(true);
    this.importError.set(null);
    this.importSuccess.set(null);

    const formValue = this.importForm.value;
    const totalTime = this.parseTimeToSeconds(formValue.totalTime || '');

    if (!totalTime) {
      this.importError.set('Format de temps invalide. Utilisez H:MM:SS (ex: 1:30:00)');
      this.isImportingManual.set(false);
      return;
    }

    const roxzoneTime = formValue.roxzoneTime ? this.parseTimeToSeconds(formValue.roxzoneTime) : undefined;
    const runTotal = formValue.runTotal ? this.parseTimeToSeconds(formValue.runTotal) : undefined;
    const bestRunLap = formValue.bestRunLap ? this.parseTimeToSeconds(formValue.bestRunLap) : undefined;

    // Construire le tableau des temps par segment
    const times: Array<{ segment: string; timeSeconds: number; place?: number }> = [];
    const segmentsArray = this.importForm.get('segments') as FormArray;

    SEGMENTS.forEach((segment, index) => {
      const segmentGroup = segmentsArray.at(index);
      const timeStr = segmentGroup.get('time')?.value;
      const placeStr = segmentGroup.get('place')?.value;

      if (timeStr && timeStr.trim() !== '') {
        const timeSeconds = this.parseTimeToSeconds(timeStr);
        if (timeSeconds !== null) {
          times.push({
            segment: segment.key,
            timeSeconds,
            place: placeStr && placeStr.trim() !== '' ? parseInt(placeStr, 10) : undefined,
          });
        }
      }
    });

    const importData = {
      name: formValue.name!,
      city: formValue.city!,
      date: formValue.date!,
      category: formValue.category!,
      totalTime,
      roxzoneTime,
      runTotal,
      bestRunLap,
      times: times.length > 0 ? times : undefined,
      sourceUrl: formValue.sourceUrl || undefined,
      source: formValue.sourceUrl?.includes('results.hyrox.com') ? 'results.hyrox.com' : formValue.sourceUrl?.includes('hyresult.com') ? 'hyresult.com' : 'manual',
    };

    this.#http.post<{ success: boolean; data: unknown; message?: string }>(`${environment.apiUrl}/courses/import`, importData).subscribe({
      next: (response) => {
        this.importSuccess.set(response.message || 'Course importée avec succès');
        this.importForm.reset();
        this.isImportingManual.set(false);
      },
      error: (error) => {
        this.importError.set(error.error?.message || 'Erreur lors de l\'import de la course');
        this.isImportingManual.set(false);
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
}
