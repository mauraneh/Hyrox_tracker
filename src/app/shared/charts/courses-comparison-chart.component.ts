import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
} from 'ng-apexcharts';
import type { ProgressionData } from 'src/app/core/types/interfaces';

@Component({
  selector: 'app-courses-comparison-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="w-full">
      @if (sortedCourses().length === 0) {
        <div class="text-hyrox-gray-400 text-sm text-center py-8">Aucune course à comparer.</div>
      } @else {
        <apx-chart
          [series]="series()"
          [chart]="chartOptions()"
          [xaxis]="xaxis()"
          [yaxis]="yaxis()"
          [plotOptions]="plotOptions()"
          [dataLabels]="dataLabels()"
          [grid]="grid()"
          [tooltip]="tooltip()"
          [legend]="legend()"
          [colors]="colors()"
        ></apx-chart>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesComparisonChartComponent {
  @Input({ required: true })
  set courses(value: ProgressionData[]) {
    this.#courses.set(Array.isArray(value) ? value : []);
  }

  readonly #courses = signal<ProgressionData[]>([]);

  readonly sortedCourses = computed(() =>
    [...this.#courses()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  );

  readonly series = computed<ApexAxisChartSeries>(() => {
    const courses = this.sortedCourses();
    const bestTime = courses.length > 0 ? Math.min(...courses.map((c) => c.totalTime)) : 0;

    return [
      {
        name: 'Temps total',
        data: courses.map((c) => ({
          x: this.formatLabel(c),
          y: c.totalTime,
          fillColor: c.totalTime === bestTime ? '#22c55e' : '#f6c744',
          meta: { category: c.category },
        })),
      },
    ];
  });

  readonly chartOptions = computed<ApexChart>(() => ({
    type: 'bar',
    height: 340,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true },
    foreColor: '#9ca3af',
    fontFamily: 'inherit',
  }));

  readonly plotOptions = computed<ApexPlotOptions>(() => ({
    bar: {
      borderRadius: 6,
      columnWidth: '60%',
      distributed: true,
    },
  }));

  readonly dataLabels = computed<ApexDataLabels>(() => ({
    enabled: true,
    formatter: (val: number) => this.formatTime(Math.round(val)),
    style: {
      fontSize: '11px',
      colors: ['#111827'],
      fontWeight: 'bold',
    },
    offsetY: -6,
  }));

  readonly grid = computed<ApexGrid>(() => ({
    borderColor: '#374151',
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
  }));

  readonly xaxis = computed<ApexXAxis>(() => ({
    type: 'category',
    labels: {
      style: { colors: '#9ca3af', fontSize: '12px' },
      rotate: -30,
      rotateAlways: false,
      trim: true,
      maxHeight: 80,
    },
    axisBorder: { color: '#374151' },
    axisTicks: { color: '#374151' },
    tooltip: { enabled: false },
  }));

  readonly yaxis = computed<ApexYAxis>(() => ({
    labels: {
      formatter: (val: number) => this.formatTime(Math.round(val)),
      style: { colors: '#9ca3af' },
    },
    title: {
      text: 'Temps total',
      style: { color: '#9ca3af', fontWeight: 400 },
    },
  }));

  readonly tooltip = computed<ApexTooltip>(() => ({
    theme: 'dark',
    y: {
      formatter: (val: number) => this.formatTime(Math.round(val)),
      title: { formatter: () => 'Temps: ' },
    },
  }));

  readonly legend = computed<ApexLegend>(() => ({ show: false }));

  readonly colors = computed<string[]>(() => {
    const courses = this.sortedCourses();
    if (courses.length === 0) return ['#f6c744'];
    const bestTime = Math.min(...courses.map((c) => c.totalTime));
    return courses.map((c) => (c.totalTime === bestTime ? '#22c55e' : '#f6c744'));
  });

  private formatLabel(course: ProgressionData): string {
    const date = new Date(course.date);
    const d = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
    return `${course.name}\n${d}`;
  }

  private formatTime(seconds: number): string {
    const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = Math.floor(safe % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
