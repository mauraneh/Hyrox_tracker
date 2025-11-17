import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-dark-900 dark:text-white mb-2">Hyrox Tracker</h1>
          <p class="text-dark-600 dark:text-dark-400">Connectez-vous à votre compte</p>
        </div>

        <div class="card">
          @if (errorMessage) {
          <div class="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {{ errorMessage }}
          </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="label" for="email">Email</label>
              <input type="email" id="email" class="input" formControlName="email" placeholder="john.doe@example.com" />
              @if (loginForm.controls['email'].invalid && loginForm.controls['email'].touched) {
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">Email valide requis</p>
              }
            </div>

            <div class="mb-6">
              <label class="label" for="password">Mot de passe</label>
              <input type="password" id="password" class="input" formControlName="password" placeholder="••••••••" />
              @if (loginForm.controls['password'].invalid && loginForm.controls['password'].touched) {
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">Mot de passe requis</p>
              }
            </div>

            <button type="submit" class="btn-primary w-full mb-4" [disabled]="loginForm.invalid || isLoading">
              @if (isLoading) {
              <span>Connexion en cours...</span>
              } @else {
              <span>Se connecter</span>
              }
            </button>

            <p class="text-center text-sm text-dark-600 dark:text-dark-400">
              Pas encore de compte ?
              <a routerLink="/auth/register" class="text-primary-500 hover:text-primary-600 font-medium">
                S'inscrire
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginPage {
  #authService = inject(AuthService);
  #formBuilder = inject(FormBuilder);

  isLoading = false;
  errorMessage = '';

  loginForm = this.#formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.getRawValue();

      this.#authService.login(email, password).subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.error?.message || 'Une erreur est survenue';
        },
      });
    }
  }
}


