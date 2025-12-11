import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-hyrox-black px-4 py-12">
      <div class="max-w-md w-full">
        <div class="text-center mb-10">
          <h1 class="hyrox-title mb-3">Hyrox Tracker</h1>
          <p class="text-hyrox-gray-400 text-sm uppercase tracking-wide font-semibold">Connectez-vous à votre compte</p>
        </div>

        <div class="card border-hyrox-yellow/30 shadow-2xl">
          @if (errorMessage) {
          <div class="mb-4 p-4 bg-red-900/30 border-2 border-red-500 text-red-300 rounded-lg text-sm">
            {{ errorMessage }}
          </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="label" for="email">Email</label>
              <input type="email" id="email" class="input" formControlName="email" placeholder="john.doe@example.com" />
              @if (loginForm.controls['email'].invalid && loginForm.controls['email'].touched) {
              <p class="mt-1 text-sm text-red-400">Email valide requis</p>
              }
            </div>

            <div class="mb-6">
              <label class="label" for="password">Mot de passe</label>
              <input type="password" id="password" class="input" formControlName="password" placeholder="••••••••" />
              @if (loginForm.controls['password'].invalid && loginForm.controls['password'].touched) {
              <p class="mt-1 text-sm text-red-400">Mot de passe requis</p>
              }
            </div>

            <button type="submit" class="btn-primary w-full mb-4" [disabled]="loginForm.invalid || isLoading">
              @if (isLoading) {
              <span>Connexion en cours...</span>
              } @else {
              <span>Se connecter</span>
              }
            </button>

            <p class="text-center text-sm text-hyrox-gray-400">
              Pas encore de compte ?
              <a routerLink="/auth/register" class="text-hyrox-yellow hover:text-white font-bold transition-colors">
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


