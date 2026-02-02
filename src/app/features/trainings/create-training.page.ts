import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TrainingFormat, TrainingType } from '@core/types/enums';
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
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  template: `
      <div class="min-h-screen bg-hyrox-black">
          <div class="max-w-3xl mx-auto px-4 py-8">
              <div class="flex items-center justify-between gap-4 mb-6">
                  <h1 class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide">Créer un entraînement</h1>
                  <a routerLink="/trainings" class="btn-primary">Retour</a>
              </div>

              <div class="card">
                  <form class="grid grid-cols-1 gap-4" [formGroup]="form" (ngSubmit)="submit()">

                      <div>
                          <label class="block text-hyrox-gray-300 mb-1">Type</label>
                          <select class="w-full" formControlName="type">
                              <option value="" disabled>Choisir un type</option>
                              <option *ngFor="let t of trainingTypes()" [value]="t">{{ t }}</option>
                          </select>
                          <p *ngIf="isTouchedInvalid('type')" class="text-red-400 text-sm mt-1">Le type est obligatoire.</p>
                      </div>

                      <div>
                          <label class="block text-hyrox-gray-300 mb-1">Date</label>
                          <input class="w-full" type="datetime-local" formControlName="date" />
                          <p *ngIf="isTouchedInvalid('date')" class="text-red-400 text-sm mt-1">La date est obligatoire.</p>
                      </div>

                      <div>
                          <label class="block text-hyrox-gray-300 mb-1">Nom de l'exercice</label>
                          <input class="w-full" type="text" formControlName="exerciseName" placeholder="ex: Back Squat / 5km easy" />
                      </div>

                      <div>
                          <label class="block text-hyrox-gray-300 mb-1">Format</label>
                          <select class="w-full" formControlName="format">
                              <option [ngValue]="null">Aucun</option>
                              <option *ngFor="let f of trainingFormats()" [ngValue]="f">{{ f }}</option>
                          </select>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                              <label class="block text-hyrox-gray-300 mb-1">Rounds</label>
                              <input class="w-full" type="number" min="0" step="1" formControlName="rounds" placeholder="ex: 5" />
                              <p *ngIf="isTouchedInvalid('rounds')" class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                          </div>
                          <div>
                              <label class="block text-hyrox-gray-300 mb-1">Sets</label>
                              <input class="w-full" type="number" min="0" step="1" formControlName="sets" placeholder="ex: 5" />
                              <p *ngIf="isTouchedInvalid('sets')" class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                          </div>
                          <div>
                              <label class="block text-hyrox-gray-300 mb-1">Reps</label>
                              <input class="w-full" type="number" min="0" step="1" formControlName="reps" placeholder="ex: 8" />
                              <p *ngIf="isTouchedInvalid('reps')" class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                          </div>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                              <label class="block text-hyrox-gray-300 mb-1">Durée (minutes)</label>
                              <input class="w-full" type="number" min="0" step="1" formControlName="durationMinutes" placeholder="ex: 60" />
                              <p *ngIf="isTouchedInvalid('durationMinutes')" class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                          </div>
                          <div>
                              <label class="block text-hyrox-gray-300 mb-1">Distance (km)</label>
                              <input class="w-full" type="number" min="0" step="0.01" formControlName="distanceKm" placeholder="ex: 10.5" />
                              <p *ngIf="isTouchedInvalid('distanceKm')" class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                          </div>
                          <div>
                              <label class="block text-hyrox-gray-300 mb-1">Repos (secondes)</label>
                              <input class="w-full" type="number" min="0" step="1" formControlName="restSeconds" placeholder="ex: 90" />
                              <p *ngIf="isTouchedInvalid('restSeconds')" class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                          </div>
                      </div>

                      <div>
                          <label class="block text-hyrox-gray-300 mb-1">Charge (kg)</label>
                          <input class="w-full" type="number" min="0" step="0.5" formControlName="weightKg" placeholder="ex: 80" />
                          <p *ngIf="isTouchedInvalid('weightKg')" class="text-red-400 text-sm mt-1">Doit être ≥ 0.</p>
                      </div>

                      <div>
                          <label class="block text-hyrox-gray-300 mb-1">Commentaire</label>
                          <textarea class="w-full" rows="4" formControlName="comment" placeholder="ex: Felt strong today"></textarea>
                      </div>

                      <div class="flex items-center gap-3 pt-2">
                          <button type="submit" class="btn-primary" [disabled]="form.invalid || isSubmitting">
                              {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
                          </button>
                          <button type="button" class="btn-secondary" (click)="cancel()" [disabled]="isSubmitting">Annuler</button>

                          <p *ngIf="submitted && form.invalid" class="text-red-400 text-sm">Vérifie les champs en rouge.</p>
                          <p *ngIf="errorMessage" class="text-red-400 text-sm">{{ errorMessage }}</p>
                      </div>
                  </form>
              </div>
          </div>
      </div>
  `,
})
export class CreateTrainingPage
{
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/trainings`;

  protected readonly trainingFormats = computed(() => Object.values(TrainingFormat));
  protected readonly trainingTypes = computed(() => Object.values(TrainingType));

  submitted = false;
  isSubmitting = false;
  errorMessage: string | null = null;

  form = this.formBuilder.nonNullable.group({
    type: ['', Validators.required],
    date: ['', Validators.required],

    exerciseName: this.formBuilder.control<string | null>(null),
    format: this.formBuilder.control<TrainingFormat | null>(null),

    rounds: this.formBuilder.control<number | null>(null, [Validators.min(0)]),
    sets: this.formBuilder.control<number | null>(null, [Validators.min(0)]),
    reps: this.formBuilder.control<number | null>(null, [Validators.min(0)]),

    weightKg: this.formBuilder.control<number | null>(null, [Validators.min(0)]),

    durationMinutes: this.formBuilder.control<number | null>(null, [Validators.min(0)]),
    distanceKm: this.formBuilder.control<number | null>(null, [Validators.min(0)]),
    restSeconds: this.formBuilder.control<number | null>(null, [Validators.min(0)]),

    comment: this.formBuilder.control<string | null>(null),
  });

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

    const token = this.authService.getToken();

    if (!token)
    {
      this.errorMessage = 'Vous devez être connecté.';
      this.router.navigate(['/auth/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.isSubmitting = true;

    this.httpClient.post(this.apiUrl, payload, { headers }).subscribe({
      next: () =>
      {
        this.isSubmitting = false;
        this.router.navigate(['/trainings']);
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
    this.router.navigate(['/trainings']);
  }
}
