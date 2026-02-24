import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexMarkers,
  ApexLegend,
} from 'ng-apexcharts';

export type TimePoint = { x: number; y: number }; // x: epoch ms, y: totalTime en secondes

@Component({
  selector: 'app-courses-time-area-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="w-full">
      @if (series().length === 0 || series()[0].data.length === 0) {
        <div class="text-hyrox-gray-400 text-sm">Aucune donn\u00e9e \u00e0 afficher.</div>
      } @else {
        <apx-chart
          [series]="series()"
          [chart]="chartOptions()"
          [xaxis]="xaxis()"
          [yaxis]="yaxis()"
          [stroke]="stroke()"
          [fill]="fill()"
          [dataLabels]="dataLabels()"
          [grid]="grid()"
          [tooltip]="tooltip()"
          [markers]="markers()"
          [legend]="legend()"
        ></apx-chart>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesTimeAreaChartComponent {
  @Input({ required: true })
  set points(value: TimePoint[]) {
    this.#points.set(Array.isArray(value) ? value : []);
  }

  @Input() title = 'Progression (temps total)';

  readonly #points = signal<TimePoint[]>([]);

  readonly series = computed<ApexAxisChartSeries>(() => [
    {
      name: this.title,
      data: this.#points(),
    },
  ]);

  readonly chartOptions = computed<ApexChart>(() => ({
    type: 'area',
    height: 320,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true },
    foreColor: '#9ca3af', // gray-400
    fontFamily: 'inherit',
  }));

  readonly stroke = computed<ApexStroke>(() => ({
    curve: 'smooth', // => spline
    width: 3,
  }));

  readonly fill = computed<ApexFill>(() => ({
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  }));

  readonly dataLabels = computed<ApexDataLabels>(() => ({ enabled: false }));

  readonly grid = computed<ApexGrid>(() => ({
    borderColor: '#374151', // gray-700
    strokeDashArray: 4,
  }));

  readonly markers = computed<ApexMarkers>(() => ({
    size: 4,
    colors: ['#f6c744'],
    strokeColors: '#111827',
    strokeWidth: 2,
    hover: { size: 6 },
  }));

  readonly legend = computed<ApexLegend>(() => ({ show: false }));

  readonly xaxis = computed<ApexXAxis>(() => ({
    type: 'datetime',
    labels: {
      datetimeUTC: false,
    },
    tooltip: { enabled: false },
  }));

  readonly yaxis = computed<ApexYAxis>(() => ({
    labels: {
      formatter: (val: number) => this.formatTime(Math.round(val)),
    },
  }));

  readonly tooltip = computed<ApexTooltip>(() => ({
    theme: 'dark',
    x: {
      format: 'dd MMM yyyy',
    },
    y: {
      formatter: (val: number) => this.formatTime(Math.round(val)),
      title: {
        formatter: () => 'Temps: ',
      },
    },
  }));

  private formatTime(seconds: number): string {
    const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = Math.floor(safe % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
