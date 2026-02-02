import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Course, CourseTime } from 'src/app/core/types/interfaces';

const SEGMENT_LABELS: Record<string, string> = {
  run1: 'Run 1',
  skiErg: '1000m SkiErg',
  run2: 'Run 2',
  sledPush: '50m Sled Push',
  run3: 'Run 3',
  sledPull: '50m Sled Pull',
  run4: 'Run 4',
  burpeeBroadJump: '80m Burpee Broad Jump',
  run5: 'Run 5',
  row: '1000m Row',
  run6: 'Run 6',
  farmerCarry: '200m Farmers Carry',
  run7: 'Run 7',
  sandbagLunges: '100m Sandbag Lunges',
  run8: 'Run 8',
  wallBalls: 'Wall Balls',
};

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './course-detail.page.html',
  styleUrl: './course-detail.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDetailPage implements OnInit, OnDestroy {
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #http = inject(HttpClient);
  #authService = inject(AuthService);

  currentUser = this.#authService.currentUser;
  course = signal<Course | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  showUserMenu = signal(false);
  isDeleting = signal(false);

  ngOnInit(): void {
    document.addEventListener('click', this.#handleDocumentClick);
    const id = this.#route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCourse(id);
    } else {
      this.error.set('Identifiant de course manquant');
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.#handleDocumentClick);
  }

  #handleDocumentClick = (event: Event): void => {
    if (this.showUserMenu()) {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        this.closeUserMenu();
      }
    }
  };

  loadCourse(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.#http.get<{ success: boolean; data: Course }>(`${environment.apiUrl}/courses/${id}`).subscribe({
      next: (response) => {
        this.course.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors du chargement de la course');
        this.isLoading.set(false);
      },
    });
  }

  toggleUserMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showUserMenu.update((value) => !value);
  }

  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  logout(): void {
    this.#authService.logout();
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

  getSegmentLabel(segmentKey: string): string {
    return SEGMENT_LABELS[segmentKey] ?? segmentKey;
  }

  getOrderedTimes(course: Course): CourseTime[] {
    const order = Object.keys(SEGMENT_LABELS);
    const times = course.times ?? [];
    return [...times].sort((a, b) => order.indexOf(a.segment) - order.indexOf(b.segment));
  }

  deleteCourse(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette course ?')) return;
    this.isDeleting.set(true);
    this.#http.delete<{ success: boolean; message?: string }>(`${environment.apiUrl}/courses/${id}`).subscribe({
      next: () => {
        this.#router.navigate(['/courses']);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors de la suppression');
        this.isDeleting.set(false);
      },
    });
  }
}
