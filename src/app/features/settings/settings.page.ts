import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <nav class="bg-hyrox-gray-900 border-b border-hyrox-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-8">
              <h1 class="hyrox-title">Hyrox Tracker</h1>
              <nav class="hidden md:flex space-x-4">
                <a routerLink="/dashboard" class="text-hyrox-gray-400 hover:text-white">Dashboard</a>
                <a routerLink="/courses" class="text-hyrox-gray-400 hover:text-white">Courses</a>
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
        <h1 class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide mb-8">Paramètres</h1>

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
  showDeleteConfirmation = signal(false);
  showUserMenu = signal(false);

  constructor() {
    // Fermer le menu si on clique en dehors
    document.addEventListener('click', (event) => {
      if (this.showUserMenu()) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          this.closeUserMenu();
        }
      }
    });
  }
  isDeletingAccount = signal(false);
  deleteError = signal<string | null>(null);

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
}
