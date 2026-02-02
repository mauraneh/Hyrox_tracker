import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Course } from 'src/app/core/types/interfaces';

type SortOrder = 'date-desc' | 'date-asc' | 'time-asc' | 'time-desc' | 'city-asc' | 'category-asc';

function compareCourses(a: Course, b: Course, order: SortOrder): number {
  switch (order) {
    case 'date-desc':
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    case 'date-asc':
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    case 'time-asc':
      return a.totalTime - b.totalTime;
    case 'time-desc':
      return b.totalTime - a.totalTime;
    case 'city-asc':
      return a.city.localeCompare(b.city, 'fr');
    case 'category-asc':
      return a.category.localeCompare(b.category, 'fr');
    default:
      return 0;
  }
}

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './courses-list.page.html',
  styleUrl: './courses-list.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesListPage implements OnInit, OnDestroy {
  #authService = inject(AuthService);
  #http = inject(HttpClient);

  currentUser = this.#authService.currentUser;
  pastCourses = signal<Course[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  showUserMenu = signal(false);
  isExporting = signal(false);

  filterCity = signal<string>('');
  filterCategory = signal<string>('');

  sortOrder = signal<SortOrder>('date-desc');

  readonly sortOptions: { value: SortOrder; label: string }[] = [
    { value: 'date-desc', label: 'Date (récent → ancien)' },
    { value: 'date-asc', label: 'Date (ancien → récent)' },
    { value: 'time-asc', label: 'Temps (croissant)' },
    { value: 'time-desc', label: 'Temps (décroissant)' },
    { value: 'city-asc', label: 'Ville (A-Z)' },
    { value: 'category-asc', label: 'Catégorie (A-Z)' },
  ];

  uniqueCategories = computed(() => {
    const courses = this.pastCourses();
    return [...new Set(courses.map((course) => course.category))].sort();
  });

  filteredCourses = computed(() => {
    const courses = this.pastCourses();
    const city = this.filterCity().trim().toLowerCase();
    const category = this.filterCategory().trim().toLowerCase();
    const order = this.sortOrder();
    let result = courses.filter((course) => {
      if (city && !course.city.toLowerCase().includes(city)) return false;
      if (category && !course.category.toLowerCase().includes(category)) return false;
      return true;
    });
    result = [...result].sort((a, b) => compareCourses(a, b, order));
    return result;
  });

  ngOnInit(): void {
    this.loadCourses();
    document.addEventListener('click', this.#handleDocumentClick);
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

  loadCourses(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.#http.get<{ success: boolean; data: Course[] }>(`${environment.apiUrl}/courses`).subscribe({
      next: (response) => {
        const all = response.data ?? [];
        this.pastCourses.set(this.filterPastCourses(all));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors du chargement des courses');
        this.isLoading.set(false);
      },
    });
  }

  private filterPastCourses(courses: Course[]): Course[] {
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayMs = todayEnd.getTime();
    return courses
      .filter((course) => new Date(course.date).getTime() <= todayMs)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  resetFilters(): void {
    this.filterCity.set('');
    this.filterCategory.set('');
    this.sortOrder.set('date-desc');
  }

  deleteCourse(course: Course): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette course ?')) return;
    this.#http.delete<{ success: boolean; message?: string }>(`${environment.apiUrl}/courses/${course.id}`).subscribe({
      next: () => {
        this.pastCourses.update((list) => list.filter((c) => c.id !== course.id));
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors de la suppression');
      },
    });
  }

  exportCsv(): void {
    const courses = this.filteredCourses();
    if (courses.length === 0) return;

    this.isExporting.set(true);
    const headers = ['Nom', 'Ville', 'Date', 'Catégorie', 'Temps total (s)', 'Temps total (H:MM:SS)'];
    const rows = courses.map((course) => [
      course.name,
      course.city,
      course.date,
      course.category,
      String(course.totalTime),
      this.formatTime(course.totalTime),
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hyrox-courses-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.isExporting.set(false);
  }
}
