import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from 'src/environments/environment';

import * as L from 'leaflet';

type DataEsCoordsObject =
  {
    lat?: number;
    lon?: number;
  };

type DataEsFields =
  {
    equip_nom?: string;
    equip_type_name?: string;
    inst_nom?: string;
    inst_adresse?: string;
    inst_cp?: string;
    new_name?: string; // ville
    dep_code?: string;
    dep_nom?: string;
    reg_nom?: string;
    equip_coordonnees?: DataEsCoordsObject | [number, number];
  };

type DataEsResponse =
  {
    total_count?: number;
    results?: DataEsFields[];
  };

@Component({
  selector: 'app-training-around',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
      <div class="min-h-screen bg-hyrox-black">
          <div class="max-w-7xl mx-auto px-4 py-8">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h1 class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide">Entraînements autour</h1>
                  <a routerLink="/trainings" class="btn-outline">Retour</a>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div class="lg:col-span-2 card p-0 overflow-hidden">
                      <div id="training-around-map" class="w-full h-[520px]"></div>
                  </div>

                  <div class="card">
                      <h2 class="text-lg font-bold text-white mb-4">Rechercher un lieu</h2>

                      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
                          <div>
                              <label class="label" for="city">Ville</label>
                              <input id="city" type="text" class="input" formControlName="city" placeholder="Perpignan" />
                              <p class="text-xs text-hyrox-gray-500 mt-1">Optionnel si vous renseignez un département.</p>
                          </div>

                          <div>
                              <label class="label" for="department">Département</label>
                              <input id="department" type="text" class="input" formControlName="department" placeholder="66" />
                              <p class="text-xs text-hyrox-gray-500 mt-1">Optionnel si vous renseignez une ville.</p>
                          </div>

                          <div>
                              <label class="label" for="limit">Limite</label>
                              <input id="limit" type="number" class="input" formControlName="limit" min="1" max="100" />
                          </div>

                          <div *ngIf="errorMessage" class="rounded-lg border border-red-900/40 bg-red-900/10 p-3 text-sm text-red-300">
                              {{ errorMessage }}
                          </div>

                          <div class="flex gap-3">
                              <button type="submit" class="btn-primary flex-1" [disabled]="loading">
                                  {{ loading ? 'Recherche…' : 'Rechercher' }}
                              </button>
                              <button type="button" class="btn-secondary" (click)="reset()" [disabled]="loading">Reset</button>
                          </div>
                      </form>

                      <div class="mt-6">
                          <p class="text-sm text-hyrox-gray-400">
                              Résultats: <span class="text-white font-semibold">{{ resultsCount }}</span>
                          </p>
                          <p class="text-xs text-hyrox-gray-500 mt-1">
                              Astuce: utilisez le formulaire puis cliquez sur Rechercher.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  `,
})
export class TrainingAroundPage implements AfterViewInit
{
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly httpClient = inject(HttpClient);

  public errorMessage: string | null = null;
  public loading = false;
  public resultsCount = 0;

  public form = this.formBuilder.nonNullable.group({
    city: [''],
    department: [''],
    limit: [20],
  });

  private map?: L.Map;
  private markersLayer?: L.LayerGroup;

  public ngAfterViewInit(): void
  {
    this.initMap();

    // ✅ IMPORTANT : on ne lance plus aucune requête au chargement
    // Si tu veux une carte vide au départ, c’est tout.
  }

  public onSubmit(): void
  {
    if (this.loading)
    {
      return;
    }

    const city = this.form.controls.city.value.trim();
    const department = this.form.controls.department.value.trim();
    const limit = Number(this.form.controls.limit.value ?? 20);

    if (!city && !department)
    {
      this.errorMessage = 'Veuillez renseigner une ville ou un département.';
      this.resultsCount = 0;
      this.clearMarkers();
      return;
    }

    this.errorMessage = null;

    this.fetchPlaces({
      city: city || undefined,
      department: department || undefined,
      limit,
    });
  }

  public reset(): void
  {
    this.form.reset({ city: '', department: '', limit: 20 });
    this.errorMessage = null;
    this.resultsCount = 0;
    this.clearMarkers();

    // ✅ Reset ne relance pas de requête (tu peux changer si tu veux)
  }

  private fetchPlaces(filters: { city?: string; department?: string; limit?: number }): void
  {
    this.loading = true;
    this.errorMessage = null;

    let params = new HttpParams();
    if (filters.department)
    {
      params = params.set('department', filters.department);
    }
    if (filters.city)
    {
      params = params.set('city', filters.city);
    }
    if (filters.limit != null)
    {
      params = params.set('limit', String(filters.limit));
    }

    const url = `${environment.apiUrl}/trainings/training-around`;

    this.httpClient
      .get<DataEsResponse>(url, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) =>
        {
          const results = Array.isArray(data?.results) ? data.results : [];
          this.resultsCount = results.length;
          this.renderMarkers(results);
          this.loading = false;
        },
        error: (err) =>
        {
          this.loading = false;
          this.resultsCount = 0;
          this.clearMarkers();
          this.errorMessage = err?.error?.message ?? 'Impossible de récupérer les lieux. Vérifiez l’API et réessayez.';
        },
      });
  }

  private initMap(): void
  {
    const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
    const iconUrl = 'assets/leaflet/marker-icon.png';
    const shadowUrl = 'assets/leaflet/marker-shadow.png';


    L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

    this.map = L.map('training-around-map', {
      center: [46.603354, 1.888334], // France
      zoom: 6,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    setTimeout(() =>
    {
      this.map?.invalidateSize();
    }, 0);
  }

  private clearMarkers(): void
  {
    this.markersLayer?.clearLayers();
  }

  private renderMarkers(items: DataEsFields[]): void
  {
    this.clearMarkers();

    if (!this.map || !this.markersLayer)
    {
      return;
    }

    const bounds = L.latLngBounds([]);
    let hasAny = false;

    for (const fields of items)
    {
      const latLng = toLatLng(fields.equip_coordonnees);
      if (!latLng)
      {
        continue;
      }

      const [lat, lng] = latLng;

      const title = fields.equip_nom ?? "Lieu d'entraînement";
      const city = fields.new_name ?? '';
      const dep = fields.dep_code ? `(${fields.dep_code})` : '';
      const address = [fields.inst_adresse, fields.inst_cp, city].filter(Boolean).join(' ');

      L.marker([lat, lng]).bindPopup(
        `<div style="min-width:220px">
           <div style="font-weight:700">${escapeHtml(title)}</div>
           <div style="opacity:.85">${escapeHtml([city, dep].filter(Boolean).join(' '))}</div>
           <div style="margin-top:6px; font-size:12px; opacity:.8">${escapeHtml(address)}</div>
         </div>`,
      ).addTo(this.markersLayer);

      bounds.extend([lat, lng]);
      hasAny = true;
    }

    if (hasAny)
    {
      this.map.fitBounds(bounds.pad(0.2));
    }
  }
}

function toLatLng(coords: DataEsCoordsObject | [number, number] | undefined): [number, number] | null
{
  if (!coords)
  {
    return null;
  }

  if (!Array.isArray(coords))
  {
    const lat = coords.lat;
    const lon = coords.lon;

    if (typeof lat === 'number' && Number.isFinite(lat) && typeof lon === 'number' && Number.isFinite(lon))
    {
      return [lat, lon];
    }

    return null;
  }

  if (coords.length !== 2)
  {
    return null;
  }

  const [lat, lng] = coords;
  if (Number.isFinite(lat) && Number.isFinite(lng))
  {
    return [lat, lng];
  }

  return null;
}

function escapeHtml(value: string): string
{
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
