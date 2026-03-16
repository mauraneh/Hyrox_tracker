import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import type { StationStats } from 'src/app/core/types/interfaces';

const STATION_LABELS: Record<string, string> = {
  run1: 'Run 1',
  run2: 'Run 2',
  run3: 'Run 3',
  run4: 'Run 4',
  run5: 'Run 5',
  run6: 'Run 6',
  run7: 'Run 7',
  run8: 'Run 8',
  skiErg: 'Ski Erg',
  sledPush: 'Sled Push',
  sledPull: 'Sled Pull',
  burpeeBroadJump: 'Burpee',
  row: 'Row Erg',
  farmerCarry: 'Farmer Carry',
  sandbagLunges: 'Sandbag',
  wallBalls: 'Wall Balls',
};

@Component({
  selector: 'app-stations-comparison-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="w-full">
      @if (stationKeys().length === 0) {
        <div class="text-hyrox-gray-400 text-sm text-center py-8">Aucune donnée de station disponible.</div>
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
          [colors]="colors"
        ></apx-chart>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StationsComparisonChartComponent {
  @Input({ required: true })
  set stats(value: Record<string, StationStats> | null) {
    this.#stats.set(value ?? {});
  }

  readonly #stats = signal<Record<string, StationStats>>({});

  readonly colors = ['#22c55e', '#3b82f6', '#f6c744'];

  readonly stationKeys = computed(() => Object.keys(this.#stats()));

  readonly series = computed<ApexAxisChartSeries>(() => {
    const stats = this.#stats();
    const keys = this.stationKeys();

    return [
      {
        name: 'Meilleur',
        data: keys.map((k) => stats[k].best),
      },
      {
        name: 'Moyenne',
        data: keys.map((k) => stats[k].average),
      },
      {
        name: 'Dernier',
        data: keys.map((k) => stats[k].latest),
      },
    ];
  });

  readonly chartOptions = computed<ApexChart>(() => ({
    type: 'bar',
    height: 400,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true },
    foreColor: '#9ca3af',
    fontFamily: 'inherit',
  }));

  readonly plotOptions = computed<ApexPlotOptions>(() => ({
    bar: {
      borderRadius: 4,
      columnWidth: '75%',
      grouped: true,
    },
  }));

  readonly dataLabels = computed<ApexDataLabels>(() => ({ enabled: false }));

  readonly grid = computed<ApexGrid>(() => ({
    borderColor: '#374151',
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
  }));

  readonly xaxis = computed<ApexXAxis>(() => ({
    type: 'category',
    categories: this.stationKeys().map((k) => STATION_LABELS[k] ?? k),
    labels: {
      style: { colors: '#9ca3af', fontSize: '11px' },
      rotate: -35,
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
  }));

  readonly tooltip = computed<ApexTooltip>(() => ({
    theme: 'dark',
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number) => this.formatTime(Math.round(val)),
    },
  }));

  readonly legend = computed<ApexLegend>(() => ({
    show: true,
    position: 'top',
    horizontalAlign: 'right',
    labels: { colors: '#9ca3af' },
    markers: { fillColors: ['#22c55e', '#3b82f6', '#f6c744'] },
  }));

  private formatTime(seconds: number): string {
    const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = Math.floor(safe % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
