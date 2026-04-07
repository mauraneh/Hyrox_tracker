import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NavbarComponent } from 'src/app/shared/navbar/navbar.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <app-navbar activePage="settings" />

      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide mb-8">Paramètres</h1>

        <!-- Confidentialité -->
        <div class="card mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Confidentialité</h2>
          <div class="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p class="text-sm font-semibold text-white">Profil public</p>
              <p class="text-xs text-hyrox-gray-400 mt-1">
                Rendre mon profil visible par tous.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              [attr.aria-checked]="isPublic()"
              class="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-hyrox-yellow focus:ring-offset-2 focus:ring-offset-hyrox-gray-900"
              [class.bg-hyrox-yellow]="isPublic()"
              [class.bg-hyrox-gray-700]="!isPublic()"
              (click)="toggleIsPublic()"
              [disabled]="isUpdatingPrivacy()"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-hyrox-black transition-transform"
                [class.translate-x-5]="isPublic()"
                [class.translate-x-1]="!isPublic()"
              ></span>
            </button>
          </div>
          @if (privacyError()) {
          <p class="mt-2 text-sm text-red-400">{{ privacyError() }}</p>
          }
        </div>

        <!-- Zone de danger -->
        <div class="card mb-8 border-red-500">
          <h2 class="text-xl font-bold text-red-400 mb-6">Zone de danger</h2>
          <p class="text-sm text-hyrox-gray-400 mb-6">
            Les actions suivantes sont irréversibles. Veuillez être certain de votre choix avant de continuer.
          </p>

          <!-- Suppression de compte -->
          <div class="p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold text-red-300 mb-2">Supprimer mon compte</h3>
                <p class="text-sm text-red-400">
                  Cette action supprimera définitivement votre compte et toutes vos données (courses, entraînements, objectifs).
                  Cette action est irréversible.
                </p>
              </div>
              <button
                (click)="confirmDeleteAccount()"
                class="btn-outline border-red-500 text-red-400 hover:bg-red-900/20 hover:text-red-300"
              >
                Supprimer le compte
              </button>
            </div>
          </div>
        </div>

        <!-- Confirmation de suppression -->
        @if (showDeleteConfirmation()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-hyrox-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold text-red-400 mb-4">Confirmer la suppression</h3>
            <p class="text-hyrox-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues.
            </p>
            <div class="flex space-x-4">
              <button
                (click)="deleteAccount()"
                class="flex-1 btn-primary bg-red-600 hover:bg-red-700 text-white"
                [disabled]="isDeletingAccount()"
              >
                @if (isDeletingAccount()) {
                <span>Suppression...</span>
                } @else {
                <span>Oui, supprimer mon compte</span>
                }
              </button>
              <button (click)="cancelDeleteAccount()" class="flex-1 btn-outline" [disabled]="isDeletingAccount()">
                Annuler
              </button>
            </div>
          </div>
        </div>
        }

        @if (deleteError()) {
        <div class="mb-4 p-4 bg-red-900/30 border-2 border-red-500 text-red-300 rounded-lg text-sm">
          {{ deleteError() }}
      </div>
        }
      </main>
    </div>
  `,
})
export class SettingsPage {
  #authService = inject(AuthService);
  #http = inject(HttpClient);

  currentUser = this.#authService.currentUser;
  isPublic = computed(() => this.currentUser()?.isPublic ?? false);
  isUpdatingPrivacy = signal(false);
  privacyError = signal<string | null>(null);
  showDeleteConfirmation = signal(false);
  isDeletingAccount = signal(false);
  deleteError = signal<string | null>(null);

  toggleIsPublic() {
    const user = this.currentUser();
    if (!user) return;
    const newValue = !this.isPublic();
    this.isUpdatingPrivacy.set(true);
    this.privacyError.set(null);
    this.#http.put<{ success: boolean; data: unknown }>(`${environment.apiUrl}/users/${user.id}`, { isPublic: newValue }).subscribe({
      next: () => {
        this.#authService.loadCurrentUser();
        this.isUpdatingPrivacy.set(false);
      },
      error: (err) => {
        this.privacyError.set(err.error?.message ?? 'Erreur lors de la mise à jour');
        this.isUpdatingPrivacy.set(false);
      },
    });
  }

  confirmDeleteAccount() {
    this.showDeleteConfirmation.set(true);
    this.deleteError.set(null);
  }

  cancelDeleteAccount() {
    this.showDeleteConfirmation.set(false);
    this.deleteError.set(null);
  }

  deleteAccount() {
    const user = this.currentUser();
    if (!user) return;

    this.isDeletingAccount.set(true);
    this.deleteError.set(null);

    this.#http.delete(`${environment.apiUrl}/users/${user.id}`).subscribe({
      next: () => {
        this.#authService.logout();
      },
      error: (error) => {
        this.deleteError.set(error.error?.message || 'Erreur lors de la suppression du compte');
        this.isDeletingAccount.set(false);
        this.showDeleteConfirmation.set(false);
      },
    });
  }
}
