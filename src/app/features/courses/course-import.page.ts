import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  selector: 'app-course-import',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './course-import.page.html',
  styleUrl: './course-import.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseImportPage {
  #http = inject(HttpClient);
  #fb = inject(FormBuilder);
  #router = inject(Router);
  #authService = inject(AuthService);

  currentUser = this.#authService.currentUser;
  importError = signal<string | null>(null);
  importSuccess = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  isImportingCsv = signal(false);
  isImportingManual = signal(false);
  showUserMenu = signal(false);

  readonly SEGMENTS = SEGMENTS;

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

  getSegmentControl(index: number, field: 'time' | 'place'): FormControl {
    const segmentsArray = this.importForm.get('segments') as FormArray;
    return segmentsArray.at(index).get(field) as FormControl;
  }

  searchOnHyrox(): void {
    const user = this.currentUser();
    if (user) {
      const firstName = encodeURIComponent(user.firstName);
      const lastName = encodeURIComponent(user.lastName);
      window.open(`https://results.hyrox.com/?firstname=${firstName}&lastname=${lastName}`, '_blank');
    }
  }

  searchOnHyResult(): void {
    const user = this.currentUser();
    if (user) {
      const searchQuery = encodeURIComponent(`${user.firstName} ${user.lastName}`);
      window.open(`https://www.hyresult.com/?s=${searchQuery}`, '_blank');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
      this.importError.set(null);
      this.importSuccess.set(null);
    }
  }

  importCsv(): void {
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
        this.importSuccess.set(response.message ?? `${importedCount} course(s) importée(s) avec succès`);
        this.selectedFile.set(null);
        this.isImportingCsv.set(false);
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setTimeout(() => this.#router.navigate(['/courses']), 1500);
      },
      error: (err) => {
        this.importError.set(err.error?.message ?? "Erreur lors de l'import du fichier CSV");
        this.isImportingCsv.set(false);
      },
    });
  }

  parseTimeToSeconds(timeString: string): number | null {
    if (!timeString?.trim()) return null;
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return null;
  }

  importManually(): void {
    if (this.importForm.invalid) return;

    this.isImportingManual.set(true);
    this.importError.set(null);
    this.importSuccess.set(null);
    const formValue = this.importForm.value;
    const totalTime = this.parseTimeToSeconds(formValue.totalTime ?? '');

    if (!totalTime) {
      this.importError.set('Format de temps invalide. Utilisez H:MM:SS (ex: 1:30:00)');
      this.isImportingManual.set(false);
      return;
    }

    const roxzoneTime = formValue.roxzoneTime ? this.parseTimeToSeconds(formValue.roxzoneTime) : undefined;
    const runTotal = formValue.runTotal ? this.parseTimeToSeconds(formValue.runTotal) : undefined;
    const bestRunLap = formValue.bestRunLap ? this.parseTimeToSeconds(formValue.bestRunLap) : undefined;
    const segmentsArray = this.importForm.get('segments') as FormArray;
    const times: Array<{ segment: string; timeSeconds: number; place?: number }> = [];

    SEGMENTS.forEach((segment, index) => {
      const group = segmentsArray.at(index);
      const timeValue = group.get('time')?.value;
      const placeValue = group.get('place')?.value;
      const timeStr = typeof timeValue === 'string' ? timeValue.trim() : String(timeValue ?? '');
      if (timeStr) {
        const secs = this.parseTimeToSeconds(timeStr);
        if (secs != null) {
          const place =
            placeValue != null && placeValue !== ''
              ? typeof placeValue === 'number'
                ? (Number.isNaN(placeValue) ? undefined : placeValue)
                : parseInt(String(placeValue).trim(), 10)
              : undefined;
          times.push({
            segment: segment.key,
            timeSeconds: secs,
            place: place !== undefined && !Number.isNaN(place) ? place : undefined,
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
      source: formValue.sourceUrl?.includes('results.hyrox.com')
        ? 'results.hyrox.com'
        : formValue.sourceUrl?.includes('hyresult.com')
          ? 'hyresult.com'
          : 'manual',
    };

    this.#http.post<{ success: boolean; data: unknown; message?: string }>(`${environment.apiUrl}/courses/import`, importData).subscribe({
      next: (response) => {
        this.importSuccess.set(response.message ?? 'Course importée avec succès');
        this.importForm.reset();
        this.isImportingManual.set(false);
        setTimeout(() => this.#router.navigate(['/courses']), 1500);
      },
      error: (err) => {
        this.importError.set(err.error?.message ?? "Erreur lors de l'import de la course");
        this.isImportingManual.set(false);
      },
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
}
