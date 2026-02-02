import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';

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
  selector: 'app-course-new',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <nav class="bg-hyrox-gray-900 border-b border-hyrox-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-8">
              <h1 class="hyrox-title">Hyrox Tracker</h1>
              <nav class="hidden md:flex space-x-4">
                <a routerLink="/dashboard" class="text-hyrox-gray-400 hover:text-white">Dashboard</a>
                <a routerLink="/courses" class="text-primary-500 font-medium">Courses</a>
                <a routerLink="/trainings" class="text-hyrox-gray-400 hover:text-white">Entraînements</a>
                <a routerLink="/stats" class="text-hyrox-gray-400 hover:text-white">Statistiques</a>
              </nav>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Menu utilisateur -->
              <div class="relative user-menu-container">
                <button
                  (click)="toggleUserMenu($event)"
                  (keydown.enter)="toggleUserMenu($event)"
                  class="flex items-center space-x-2 text-sm text-hyrox-gray-400 hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer font-medium transition-colors bg-transparent border-none p-2 rounded-lg hover:bg-hyrox-gray-800"
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
                <div class="absolute right-0 mt-2 w-48 bg-hyrox-gray-900 rounded-lg shadow-lg border border-hyrox-gray-700 py-1 z-50">
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

      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide mb-8">Ajouter une course</h1>

        @if (error()) {
        <div class="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {{ error() }}
        </div>
        }

        @if (success()) {
        <div class="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 rounded-lg text-sm">
          {{ success() }}
        </div>
        }

        <form [formGroup]="courseForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Informations générales -->
          <div class="card">
            <h2 class="text-xl font-bold text-white mb-6">Informations générales</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label" for="name">Nom de la course *</label>
                <input type="text" id="name" class="input" formControlName="name" placeholder="Hyrox Paris 2024" />
              </div>

              <div>
                <label class="label" for="city">Ville *</label>
                <input type="text" id="city" class="input" formControlName="city" placeholder="Paris" />
              </div>

              <div>
                <label class="label" for="date">Date *</label>
                <input type="date" id="date" class="input" formControlName="date" />
              </div>

              <div>
                <label class="label" for="category">Catégorie *</label>
                <select id="category" class="input" formControlName="category">
                  <option value="">Sélectionner...</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Pro Men">Pro Men</option>
                  <option value="Pro Women">Pro Women</option>
                  <option value="Doubles">Doubles</option>
                </select>
              </div>

              <div>
                <label class="label" for="totalTime">Temps total (H:MM:SS) *</label>
                <input type="text" id="totalTime" class="input" formControlName="totalTime" placeholder="1:30:00" />
                <p class="mt-1 text-xs text-hyrox-gray-500">Format: H:MM:SS</p>
              </div>
            </div>

            <!-- Statistiques globales optionnelles -->
            <div class="mt-6 pt-6 border-t border-hyrox-gray-700">
              <h3 class="text-lg font-semibold text-white mb-4">Statistiques globales (optionnel)</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="label" for="roxzoneTime">Roxzone Time (H:MM:SS)</label>
                  <input type="text" id="roxzoneTime" class="input" formControlName="roxzoneTime" placeholder="0:05:47" />
                </div>

                <div>
                  <label class="label" for="runTotal">Run Total (H:MM:SS)</label>
                  <input type="text" id="runTotal" class="input" formControlName="runTotal" placeholder="0:44:07" />
                </div>

                <div>
                  <label class="label" for="bestRunLap">Best Run Lap (MM:SS)</label>
                  <input type="text" id="bestRunLap" class="input" formControlName="bestRunLap" placeholder="5:28" />
                </div>
              </div>
            </div>
          </div>

          <!-- Segments -->
          <div class="card">
            <h2 class="text-xl font-bold text-white mb-6">Temps par segment</h2>
            <p class="text-sm text-hyrox-gray-400 mb-4">
              Renseignez les temps et positions (optionnel) pour chaque segment
            </p>

            <div class="space-y-4">
              @for (segment of SEGMENTS; track segment.key; let i = $index) {
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-dark-50 dark:bg-hyrox-gray-800 rounded-lg">
                <div class="md:col-span-1">
                  <label class="label text-sm font-medium" for="segment-time-{{i}}">{{ segment.label }}</label>
                </div>
                <div>
                  <label class="label text-xs" for="segment-time-{{i}}">Temps (MM:SS ou H:MM:SS)</label>
                  <input
                    id="segment-time-{{i}}"
                    type="text"
                    class="input text-sm"
                    [formControl]="getSegmentControl(i, 'time')"
                    placeholder="5:28"
                  />
                </div>
                <div>
                  <label class="label text-xs" for="segment-place-{{i}}">Position (optionnel)</label>
                  <input
                    id="segment-place-{{i}}"
                    type="number"
                    class="input text-sm"
                    [formControl]="getSegmentControl(i, 'place')"
                    placeholder="182"
                    min="1"
                  />
                </div>
              </div>
              }
            </div>
          </div>

          <!-- Notes -->
          <div class="card">
            <h2 class="text-xl font-bold text-white mb-4">Notes (optionnel)</h2>
            <textarea
              id="notes"
              class="input"
              formControlName="notes"
              rows="3"
              placeholder="Ajoutez des notes sur votre performance..."
            ></textarea>
          </div>

          <div class="flex space-x-4">
            <button type="submit" class="btn-primary" [disabled]="courseForm.invalid || isSubmitting()">
              @if (isSubmitting()) {
              <span>Enregistrement...</span>
              } @else {
              <span>Enregistrer la course</span>
              }
            </button>
            <a routerLink="/courses" class="btn-outline">Annuler</a>
          </div>
        </form>
      </main>
    </div>
  `,
})
export class CourseNewPage {
  #authService = inject(AuthService);
  #http = inject(HttpClient);
  #fb = inject(FormBuilder);
  #router = inject(Router);

  currentUser = this.#authService.currentUser;
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showUserMenu = signal(false);

  SEGMENTS = SEGMENTS;

  courseForm = this.#fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    city: ['', [Validators.required]],
    date: ['', [Validators.required]],
    category: ['', [Validators.required]],
    totalTime: ['', [Validators.required]],
    roxzoneTime: [''],
    runTotal: [''],
    bestRunLap: [''],
    notes: [''],
    segments: this.#fb.array(
      SEGMENTS.map(() =>
        this.#fb.group({
          time: [''],
          place: [''],
        }),
      ),
    ),
  });

  getSegmentControl(index: number, field: 'time' | 'place'): FormControl {
    const segmentsArray = this.courseForm.get('segments') as FormArray;
    return segmentsArray.at(index).get(field) as FormControl;
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

  parseTimeToSeconds(timeString: string): number | null {
    if (!timeString || timeString.trim() === '') return null;
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return null;
  }

  onSubmit() {
    if (this.courseForm.invalid) return;

    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.courseForm.value;
    const totalTime = this.parseTimeToSeconds(formValue.totalTime || '');
    const roxzoneTime = formValue.roxzoneTime ? this.parseTimeToSeconds(formValue.roxzoneTime) : undefined;
    const runTotal = formValue.runTotal ? this.parseTimeToSeconds(formValue.runTotal) : undefined;
    const bestRunLap = formValue.bestRunLap ? this.parseTimeToSeconds(formValue.bestRunLap) : undefined;

    if (!totalTime) {
      this.error.set('Format de temps total invalide. Utilisez H:MM:SS (ex: 1:30:00)');
      this.isSubmitting.set(false);
      return;
    }

    // Construire le tableau des temps par segment
    const times: Array<{ segment: string; timeSeconds: number; place?: number }> = [];
    const segmentsArray = this.courseForm.get('segments') as FormArray;

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

    const courseData = {
      name: formValue.name!,
      city: formValue.city!,
      date: formValue.date!,
      category: formValue.category!,
      totalTime,
      roxzoneTime,
      runTotal,
      bestRunLap,
      notes: formValue.notes || undefined,
      times,
    };

    this.#http.post<{ success: boolean; data: unknown; message?: string }>(`${environment.apiUrl}/courses`, courseData).subscribe({
      next: (response) => {
        this.success.set(response.message || 'Course créée avec succès');
        this.isSubmitting.set(false);
        setTimeout(() => {
          this.#router.navigate(['/courses']);
        }, 1500);
      },
      error: (error) => {
        this.error.set(error.error?.message || 'Erreur lors de la création de la course');
        this.isSubmitting.set(false);
      },
    });
  }
}
