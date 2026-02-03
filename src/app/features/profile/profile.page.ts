import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Goal, User } from 'src/app/core/types/interfaces';

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

        <!-- Objectifs personnels (todo-list) -->
        <div class="card">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 class="text-xl font-bold text-white">Mes objectifs</h2>
            <button
              type="button"
              (click)="showGoalForm.set(true)"
              class="btn-primary text-sm inline-flex items-center gap-2"
              [disabled]="showGoalForm()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un objectif
            </button>
          </div>

          @if (goalsError()) {
          <div class="mb-4 p-4 bg-red-900/30 border-2 border-red-500 text-red-300 rounded-lg text-sm">
            {{ goalsError() }}
          </div>
          }

          <!-- Barre de progression -->
          @if (!isLoadingGoals() && goals().length > 0) {
          <div class="mb-6">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-hyrox-gray-400">{{ goalsProgress().achieved }} / {{ goalsProgress().total }} atteints</span>
              <span class="text-hyrox-yellow font-semibold">{{ goalsProgress().percent }} %</span>
            </div>
            <div class="h-2 bg-hyrox-gray-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-hyrox-yellow rounded-full transition-all duration-500"
                [style.width.%]="goalsProgress().percent"
              ></div>
            </div>
          </div>
          }

          <!-- Formulaire d'ajout/modification -->
          @if (showGoalForm()) {
          <div class="mb-6 p-4 bg-hyrox-gray-800 rounded-xl border-2 border-hyrox-yellow/30">
            <h3 class="text-lg font-semibold text-white mb-4">
              {{ editingGoal() ? "Modifier l'objectif" : 'Nouvel objectif' }}
            </h3>
            <form [formGroup]="goalForm" (ngSubmit)="saveGoal()">
              <div class="space-y-4">
                <div>
                  <label class="label" for="goalTitle">Titre</label>
                  <input type="text" id="goalTitle" class="input" formControlName="title" placeholder="Ex: Passer sous 1h25" />
                  @if (goalForm.controls['title'].invalid && goalForm.controls['title'].touched) {
                  <p class="mt-1 text-sm text-red-400">Titre requis (3-100 caractères)</p>
                  }
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="label" for="targetTime">Temps cible (H:MM:SS)</label>
                    <input type="text" id="targetTime" class="input" formControlName="targetTime" placeholder="1:25:00" />
                  </div>
                  <div>
                    <label class="label" for="targetDate">Date cible</label>
                    <input type="date" id="targetDate" class="input" formControlName="targetDate" />
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="submit" class="btn-primary" [disabled]="goalForm.invalid || isSavingGoal()">
                    @if (isSavingGoal()) { <span>Enregistrement...</span> } @else {
                    <span>{{ editingGoal() ? 'Modifier' : 'Ajouter' }}</span>
                    }
                  </button>
                  <button type="button" (click)="cancelGoalForm()" class="btn-outline">Annuler</button>
                </div>
              </div>
            </form>
          </div>
          }

          <!-- Liste type todo-list -->
          @if (isLoadingGoals()) {
          <p class="text-hyrox-gray-400">Chargement des objectifs...</p>
          } @else if (goals().length === 0) {
          <div class="text-center py-8 rounded-xl bg-hyrox-gray-800/50 border border-dashed border-hyrox-gray-700">
            <p class="text-hyrox-gray-400 mb-4">Aucun objectif pour l'instant.</p>
            <button type="button" (click)="showGoalForm.set(true)" class="btn-outline text-sm">
              Créer mon premier objectif
            </button>
          </div>
          } @else {
          <div class="space-y-6">
            <!-- À atteindre -->
            @if (pendingGoals().length > 0) {
            <div>
              <h3 class="text-sm font-semibold text-hyrox-yellow uppercase tracking-wide mb-3 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-hyrox-yellow"></span>
                À atteindre ({{ pendingGoals().length }})
              </h3>
              <ul class="space-y-2 list-none p-0 m-0">
                @for (goal of pendingGoals(); track goal.id) {
                <li
                  class="group flex items-start gap-4 p-4 rounded-xl border-2 border-hyrox-gray-700 bg-hyrox-gray-800/50 hover:border-hyrox-yellow/40 transition-colors"
                >
                  <button
                    type="button"
                    (click)="markAsAchieved(goal.id)"
                    class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 border-hyrox-yellow bg-transparent hover:bg-hyrox-yellow/20 focus:outline-none focus:ring-2 focus:ring-hyrox-yellow focus:ring-offset-2 focus:ring-offset-hyrox-gray-900 transition-colors"
                    title="Marquer comme atteint"
                    aria-label="Marquer comme atteint"
                  ></button>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-white">{{ goal.title }}</p>
                    <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-hyrox-gray-400">
                      @if (goal.targetTime) {
                      <span>Temps cible: {{ formatTime(goal.targetTime) }}</span>
                      }
                      @if (goal.targetDate) {
                      <span>Date: {{ formatDate(goal.targetDate) }}</span>
                      }
                    </div>
                  </div>
                  <div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      (click)="editGoal(goal)"
                      class="p-2 rounded-lg text-hyrox-gray-400 hover:text-hyrox-yellow hover:bg-hyrox-gray-700 transition-colors"
                      title="Modifier"
                      aria-label="Modifier"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="deleteGoal(goal.id)"
                      class="p-2 rounded-lg text-hyrox-gray-400 hover:text-red-400 hover:bg-hyrox-gray-700 transition-colors"
                      title="Supprimer"
                      aria-label="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
                }
              </ul>
            </div>
            }

            <!-- Atteints -->
            @if (achievedGoals().length > 0) {
            <div>
              <h3 class="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Atteints ({{ achievedGoals().length }})
              </h3>
              <ul class="space-y-2 list-none p-0 m-0">
                @for (goal of achievedGoals(); track goal.id) {
                <li class="group flex items-start gap-4 p-4 rounded-xl border border-green-500/30 bg-green-900/10">
                  <span
                    class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold line-through text-hyrox-gray-400">{{ goal.title }}</p>
                    <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-green-300/90">
                      @if (goal.targetTime) {
                      <span>{{ formatTime(goal.targetTime) }}</span>
                      }
                      @if (goal.achievedAt) {
                      <span>Atteint le {{ formatDate(goal.achievedAt) }}</span>
                      }
                    </div>
                  </div>
                  <div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      (click)="editGoal(goal)"
                      class="p-2 rounded-lg text-hyrox-gray-400 hover:text-hyrox-yellow hover:bg-hyrox-gray-700 transition-colors"
                      title="Modifier"
                      aria-label="Modifier"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="deleteGoal(goal.id)"
                      class="p-2 rounded-lg text-hyrox-gray-400 hover:text-red-400 hover:bg-hyrox-gray-700 transition-colors"
                      title="Supprimer"
                      aria-label="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
                }
              </ul>
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

  pendingGoals = computed(() => this.goals().filter((goal) => !goal.achieved));
  achievedGoals = computed(() => this.goals().filter((goal) => goal.achieved));
  goalsProgress = computed(() => {
    const list = this.goals();
    const achieved = list.filter((goal) => goal.achieved).length;
    return { achieved, total: list.length, percent: list.length ? Math.round((achieved / list.length) * 100) : 0 };
  });

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
