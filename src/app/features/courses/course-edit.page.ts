import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Course, CourseTime } from 'src/app/core/types/interfaces';

const SEGMENTS = [
  { key: 'run1', label: 'Run 1', hasPlace: false },
  { key: 'skiErg', label: '1000m SkiErg', hasPlace: true },
  { key: 'run2', label: 'Run 2', hasPlace: false },
  { key: 'sledPush', label: '50m Sled Push', hasPlace: true },
  { key: 'run3', label: 'Run 3', hasPlace: false },
  { key: 'sledPull', label: '50m Sled Pull', hasPlace: true },
  { key: 'run4', label: 'Run 4', hasPlace: false },
  { key: 'burpeeBroadJump', label: '80m Burpee Broad Jump', hasPlace: true },
  { key: 'run5', label: 'Run 5', hasPlace: false },
  { key: 'row', label: '1000m Row', hasPlace: true },
  { key: 'run6', label: 'Run 6', hasPlace: false },
  { key: 'farmerCarry', label: '200m Farmers Carry', hasPlace: true },
  { key: 'run7', label: 'Run 7', hasPlace: false },
  { key: 'sandbagLunges', label: '100m Sandbag Lunges', hasPlace: true },
  { key: 'run8', label: 'Run 8', hasPlace: false },
  { key: 'wallBalls', label: 'Wall Balls', hasPlace: true },
];

@Component({
  selector: 'app-course-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './course-edit.page.html',
  styleUrl: './course-edit.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseEditPage implements OnInit {
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #http = inject(HttpClient);
  #fb = inject(FormBuilder);
  #authService = inject(AuthService);

  currentUser = this.#authService.currentUser;
  courseId = signal<string | null>(null);
  isLoading = signal(true);
  courseLoaded = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showUserMenu = signal(false);

  readonly SEGMENTS = SEGMENTS;

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

  ngOnInit(): void {
    const id = this.#route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId.set(id);
      this.loadCourse(id);
    } else {
      this.error.set('Identifiant de course manquant');
      this.isLoading.set(false);
    }
  }

  getSegmentControl(index: number, field: 'time' | 'place'): FormControl {
    const segmentsArray = this.courseForm.get('segments') as FormArray;
    return segmentsArray.at(index).get(field) as FormControl;
  }

  private loadCourse(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.#http.get<{ success: boolean; data: Course }>(`${environment.apiUrl}/courses/${id}`).subscribe({
      next: (response) => {
        this.patchFormWithCourse(response.data);
        this.courseLoaded.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors du chargement de la course');
        this.isLoading.set(false);
      },
    });
  }

  private secondsToTimeString(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private patchFormWithCourse(course: Course): void {
    const dateStr = course.date.slice(0, 10);
    const timesBySegment = new Map<string, CourseTime>();
    (course.times ?? []).forEach((t) => timesBySegment.set(t.segment, t));

    this.courseForm.patchValue({
      name: course.name,
      city: course.city,
      date: dateStr,
      category: course.category,
      totalTime: this.secondsToTimeString(course.totalTime),
      roxzoneTime: course.roxzoneTime != null ? this.secondsToTimeString(course.roxzoneTime) : '',
      runTotal: course.runTotal != null ? this.secondsToTimeString(course.runTotal) : '',
      bestRunLap: course.bestRunLap != null ? this.secondsToTimeString(course.bestRunLap) : '',
      notes: course.notes ?? '',
    });

    const segmentsArray = this.courseForm.get('segments') as FormArray;
    SEGMENTS.forEach((segment, index) => {
      const timeData = timesBySegment.get(segment.key);
      const group = segmentsArray.at(index);
      group.patchValue({
        time: timeData ? this.secondsToTimeString(timeData.timeSeconds) : '',
        place: timeData?.place != null ? timeData.place : '',
      });
    });
  }

  parseTimeToSeconds(timeString: string): number | null {
    if (!timeString?.trim()) return null;
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return null;
  }

  onSubmit(): void {
    if (this.courseForm.invalid) return;
    const id = this.courseId();
    if (!id) return;

    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.courseForm.value;
    const totalTime = this.parseTimeToSeconds(formValue.totalTime ?? '');
    const roxzoneTime = formValue.roxzoneTime ? this.parseTimeToSeconds(formValue.roxzoneTime) : undefined;
    const runTotal = formValue.runTotal ? this.parseTimeToSeconds(formValue.runTotal) : undefined;
    const bestRunLap = formValue.bestRunLap ? this.parseTimeToSeconds(formValue.bestRunLap) : undefined;

    if (!totalTime) {
      this.error.set('Format de temps total invalide. Utilisez H:MM:SS (ex: 1:30:00)');
      this.isSubmitting.set(false);
      return;
    }

    const segmentsArray = this.courseForm.get('segments') as FormArray;
    const times: Array<{ segment: string; timeSeconds: number; place?: number }> = [];
    SEGMENTS.forEach((segment, index) => {
      const group = segmentsArray.at(index);
      const timeValue = group.get('time')?.value;
      const placeValue = group.get('place')?.value;
      const timeStr = typeof timeValue === 'string' ? timeValue.trim() : String(timeValue ?? '');
      if (timeStr) {
        const timeSeconds = this.parseTimeToSeconds(timeStr);
        if (timeSeconds != null) {
          const place =
            placeValue != null && placeValue !== ''
              ? typeof placeValue === 'number'
                ? (Number.isNaN(placeValue) ? undefined : placeValue)
                : parseInt(String(placeValue).trim(), 10)
              : undefined;
          times.push({
            segment: segment.key,
            timeSeconds,
            place: place !== undefined && !Number.isNaN(place) ? place : undefined,
          });
        }
      }
    });

    const dateStr = formValue.date!;
    const dateIso = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00.000Z`;

    const courseData: Record<string, unknown> = {
      name: formValue.name!,
      city: formValue.city!,
      date: dateIso,
      category: formValue.category!,
      totalTime,
    };
    if (times.length > 0) courseData['times'] = times;
    if (roxzoneTime != null) courseData['roxzoneTime'] = roxzoneTime;
    if (runTotal != null) courseData['runTotal'] = runTotal;
    if (bestRunLap != null) courseData['bestRunLap'] = bestRunLap;
    if (formValue.notes?.trim()) courseData['notes'] = formValue.notes.trim();

    this.#http.put<{ success: boolean; data: unknown; message?: string }>(`${environment.apiUrl}/courses/${id}`, courseData).subscribe({
      next: (response) => {
        this.success.set(response.message ?? 'Course mise à jour');
        this.isSubmitting.set(false);
        setTimeout(() => this.#router.navigate(['/courses', id]), 1500);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors de la mise à jour');
        this.isSubmitting.set(false);
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
