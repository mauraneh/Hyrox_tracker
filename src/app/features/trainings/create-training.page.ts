import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TrainingDifficulty, TrainingFormat, TrainingType } from '@core/types/enums';
import { AuthService } from '@core/auth/auth.service';
import { environment } from 'src/environments/environment';

export type CreateTrainingPayload = {
  type: TrainingType;
  date: string;

  exerciseName?: string;
  format?: TrainingFormat;
  rounds?: number;
  sets?: number;
  reps?: number;
  weightKg?: number;

  durationSeconds?: number;
  distanceMeters?: number;
  restSeconds?: number;

  comment?: string;
};

@Component({
  selector: 'app-create-training',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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

      <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between gap-4 mb-8">
          <h1 class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide">Créer un entraînement</h1>
          <a routerLink="/trainings" class="btn-outline">Retour</a>
        </div>

        <div class="card border-hyrox-yellow/20">
          <form class="grid grid-cols-1 gap-6" [formGroup]="form" (ngSubmit)="submit()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="type">Type *</label>
                <select id="type" class="input" formControlName="type">
                  <option value="" disabled>Choisir un type</option>
                  @for (t of trainingTypes(); track t) {
                    <option [value]="t">{{ t }}</option>
                  }
                </select>
                @if (isTouchedInvalid('type')) {
                  <p class="text-red-400 text-sm mt-1">Le type est obligatoire.</p>
                }
              </div>
              <div>
                <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="date">Date *</label>
                <input id="date" class="input" type="datetime-local" formControlName="date" />
                @if (isTouchedInvalid('date')) {
                  <p class="text-red-400 text-sm mt-1">La date est obligatoire.</p>
                }
              </div>
            </div>

            @if (form.get('type')?.value) {
              <div class="rounded-xl border border-hyrox-gray-800 bg-hyrox-gray-800/50 p-4">
                <p class="text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide mb-3">Présets par niveau</p>
                <div class="flex flex-wrap gap-3">
                  <button
                    type="button"
                    (click)="loadPreset(TrainingDifficulty.NOVICE)"
                    [disabled]="isLoadingPreset()"
                    class="btn-outline inline-flex items-center gap-2"
                  >
                    @if (isLoadingPreset() && selectedPresetDifficulty() === TrainingDifficulty.NOVICE) {
                      <span>Chargement...</span>
                    } @else {
                      <span>Novice</span>
                    }
                  </button>
                  <button
                    type="button"
                    (click)="loadPreset(TrainingDifficulty.INTERMEDIATE)"
                    [disabled]="isLoadingPreset()"
                    class="btn-outline inline-flex items-center gap-2"
                  >
                    @if (isLoadingPreset() && selectedPresetDifficulty() === TrainingDifficulty.INTERMEDIATE) {
                      <span>Chargement...</span>
                    } @else {
                      <span>Intermédiaire</span>
                    }
                  </button>
                  <button
                    type="button"
                    (click)="loadPreset(TrainingDifficulty.EXPERT)"
                    [disabled]="isLoadingPreset()"
                    class="btn-outline inline-flex items-center gap-2"
                  >
                    @if (isLoadingPreset() && selectedPresetDifficulty() === TrainingDifficulty.EXPERT) {
                      <span>Chargement...</span>
                    } @else {
                      <span>Expert</span>
                    }
                  </button>
                </div>
              </div>
            }

            <div>
              <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="exerciseName">Nom de l'exercice</label>
              <input id="exerciseName" class="input" type="text" formControlName="exerciseName" placeholder="ex: Back Squat / 5km easy" />
            </div>

            <div>
              <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="format">Format</label>
              <select id="format" class="input" formControlName="format">
                <option [ngValue]="null">Aucun</option>
                @for (f of trainingFormats(); track f) {
                  <option [ngValue]="f">{{ f }}</option>
                }
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="rounds">Rounds</label>
                <input id="rounds" class="input" type="number" min="0" step="1" formControlName="rounds" placeholder="ex: 5" />
                @if (isTouchedInvalid('rounds')) {
                  <p class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                }
              </div>
              <div>
                <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="sets">Sets</label>
                <input id="sets" class="input" type="number" min="0" step="1" formControlName="sets" placeholder="ex: 5" />
                @if (isTouchedInvalid('sets')) {
                  <p class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                }
              </div>
              <div>
                <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="reps">Reps</label>
                <input id="reps" class="input" type="number" min="0" step="1" formControlName="reps" placeholder="ex: 8" />
                @if (isTouchedInvalid('reps')) {
                  <p class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="durationMinutes">Durée (minutes)</label>
                <input id="durationMinutes" class="input" type="number" min="0" step="1" formControlName="durationMinutes" placeholder="ex: 60" />
                @if (isTouchedInvalid('durationMinutes')) {
                  <p class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                }
              </div>
              <div>
                <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="distanceKm">Distance (km)</label>
                <input id="distanceKm" class="input" type="number" min="0" step="0.01" formControlName="distanceKm" placeholder="ex: 10.5" />
                @if (isTouchedInvalid('distanceKm')) {
                  <p class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                }
              </div>
              <div>
                <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="restSeconds">Repos (secondes)</label>
                <input id="restSeconds" class="input" type="number" min="0" step="1" formControlName="restSeconds" placeholder="ex: 90" />
                @if (isTouchedInvalid('restSeconds')) {
                  <p class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                }
              </div>
            </div>

            <div>
              <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="weightKg">Charge (kg)</label>
              <input id="weightKg" class="input" type="number" min="0" step="0.5" formControlName="weightKg" placeholder="ex: 80" />
              @if (isTouchedInvalid('weightKg')) {
                <p class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
              }
            </div>

            <div>
              <label class="label text-xs font-semibold text-hyrox-gray-400 uppercase tracking-wide" for="comment">Commentaire</label>
              <textarea id="comment" class="input min-h-[100px]" rows="4" formControlName="comment" placeholder="ex: Felt strong today"></textarea>
            </div>

            @if (errorMessage) {
              <p class="text-red-400 text-sm">{{ errorMessage }}</p>
            }
            @if (submitted && form.invalid) {
              <p class="text-red-400 text-sm">Vérifie les champs en rouge.</p>
            }

            <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-hyrox-gray-800">
              <button type="submit" class="btn-primary" [disabled]="form.invalid || isSubmitting">
                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
              <button type="button" class="btn-secondary" (click)="cancel()" [disabled]="isSubmitting">Annuler</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `,
})
export class CreateTrainingPage implements OnInit {
  #authService = inject(AuthService);
  #formBuilder = inject(FormBuilder);
  #httpClient = inject(HttpClient);
  #router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/trainings`;
  private readonly presetsUrl = `${environment.apiUrl}/training-presets`;

  protected readonly trainingFormats = computed(() => Object.values(TrainingFormat));
  protected readonly trainingTypes = computed(() => Object.values(TrainingType));
  protected readonly TrainingDifficulty = TrainingDifficulty;

  currentUser = this.#authService.currentUser;
  showUserMenu = signal(false);
  isLoadingPreset = signal(false);
  selectedPresetDifficulty = signal<TrainingDifficulty | null>(null);
  submitted = false;
  isSubmitting = false;
  errorMessage: string | null = null;

  form = this.#formBuilder.nonNullable.group({
    type: ['', Validators.required],
    date: ['', Validators.required],

    exerciseName: this.#formBuilder.control<string | null>(null),
    format: this.#formBuilder.control<TrainingFormat | null>(null),

    rounds: this.#formBuilder.control<number | null>(null, [Validators.min(0)]),
    sets: this.#formBuilder.control<number | null>(null, [Validators.min(0)]),
    reps: this.#formBuilder.control<number | null>(null, [Validators.min(0)]),

    weightKg: this.#formBuilder.control<number | null>(null, [Validators.min(0)]),

    durationMinutes: this.#formBuilder.control<number | null>(null, [Validators.min(0)]),
    distanceKm: this.#formBuilder.control<number | null>(null, [Validators.min(0)]),
    restSeconds: this.#formBuilder.control<number | null>(null, [Validators.min(0)]),

    comment: this.#formBuilder.control<string | null>(null),
  });

  ngOnInit(): void {
    document.addEventListener('click', (event) => {
      if (this.showUserMenu()) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          this.closeUserMenu();
        }
      }
    });
  }

  loadPreset(difficulty: TrainingDifficulty): void {
    const type = this.form.get('type')?.value;
    if (!type) return;

    const token = this.#authService.getToken();
    if (!token) return;

    this.isLoadingPreset.set(true);
    this.selectedPresetDifficulty.set(difficulty);

    const params = { type, difficulty };
    this.#httpClient
      .get<Record<string, unknown>>(this.presetsUrl, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (preset) => {
          this.applyPresetToForm(preset);
          this.isLoadingPreset.set(false);
          this.selectedPresetDifficulty.set(null);
        },
        error: () => {
          this.errorMessage = 'Impossible de charger le preset.';
          this.isLoadingPreset.set(false);
          this.selectedPresetDifficulty.set(null);
        },
      });
  }

  private applyPresetToForm(preset: Record<string, unknown>): void {
    const raw = preset['data'] != null ? (preset['data'] as Record<string, unknown>) : preset;

    const durationSeconds = raw['durationSeconds'];
    const durationMinutes =
      durationSeconds != null && typeof durationSeconds === 'number'
        ? Math.round(durationSeconds / 60)
        : null;

    const distanceMeters = raw['distanceMeters'];
    const distanceKm =
      distanceMeters != null && typeof distanceMeters === 'number'
        ? Math.round((distanceMeters / 1000) * 100) / 100
        : null;

    const vStr = (x: unknown): string | null => (typeof x === 'string' ? x : null);
    const vNum = (x: unknown): number | null => (typeof x === 'number' ? x : null);

    this.form.patchValue({
      exerciseName: vStr(raw['exerciseName']) ?? null,
      format: (typeof raw['format'] === 'string' ? raw['format'] as TrainingFormat : null) ?? null,
      rounds: vNum(raw['rounds']) ?? null,
      sets: vNum(raw['sets']) ?? null,
      reps: vNum(raw['reps']) ?? null,
      weightKg: vNum(raw['weightKg']) ?? null,
      restSeconds: vNum(raw['restSeconds']) ?? null,
      comment: vStr(raw['comment']) ?? null,
      durationMinutes,
      distanceKm,
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

  isTouchedInvalid(name: keyof CreateTrainingPage['form']['controls']): boolean
  {
    const control = this.form.controls[name];
    return control.touched && control.invalid;
  }

  submit(): void
  {
    this.submitted = true;
    this.errorMessage = null;

    if (this.form.invalid)
    {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const dateIso = new Date(raw.date).toISOString();

    const durationSeconds = raw.durationMinutes !== null
      ? Math.round(raw.durationMinutes * 60)
      : undefined;

    const distanceMeters = raw.distanceKm !== null
      ? Math.round(raw.distanceKm * 1000)
      : undefined;

    const payload: CreateTrainingPayload =
      {
        type: raw.type as TrainingType,
        date: dateIso,

        exerciseName: raw.exerciseName ?? undefined,
        format: raw.format ?? undefined,

        rounds: raw.rounds ?? undefined,
        sets: raw.sets ?? undefined,
        reps: raw.reps ?? undefined,

        weightKg: raw.weightKg ?? undefined,

        durationSeconds,
        distanceMeters,
        restSeconds: raw.restSeconds ?? undefined,

        comment: raw.comment ?? undefined,
      };

    const token = this.#authService.getToken();

    if (!token)
    {
      this.errorMessage = 'Vous devez être connecté.';
      this.#router.navigate(['/auth/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.isSubmitting = true;

    this.#httpClient.post(this.apiUrl, payload, { headers }).subscribe({
      next: () =>
      {
        this.isSubmitting = false;
        this.#router.navigate(['/trainings']);
      },
      error: (error) =>
      {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message ?? 'Erreur lors de la création de l’entraînement.';
      },
    });
  }

  cancel(): void
  {
    this.#router.navigate(['/trainings']);
  }
}
