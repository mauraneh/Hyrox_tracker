import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-hyrox-black px-4 py-12">
      <div class="max-w-md w-full">
        <div class="text-center mb-10">
          <h1 class="hyrox-title mb-3">Hyrox Tracker</h1>
          <p class="text-hyrox-gray-400 text-sm uppercase tracking-wide font-semibold">Créez votre compte</p>
        </div>

        <div class="card border-hyrox-yellow/30 shadow-2xl">
          @if (errorMessage) {
          <div class="mb-4 p-4 bg-red-900/30 border-2 border-red-500 text-red-300 rounded-lg text-sm">
            {{ errorMessage }}
          </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="label" for="firstName">Prénom</label>
                <input type="text" id="firstName" class="input" formControlName="firstName" placeholder="John" />
              </div>
              <div>
                <label class="label" for="lastName">Nom</label>
                <input type="text" id="lastName" class="input" formControlName="lastName" placeholder="Doe" />
              </div>
            </div>

            <div class="mb-4">
              <label class="label" for="email">Email</label>
              <input type="email" id="email" class="input" formControlName="email" placeholder="john.doe@example.com" />
            </div>

            <div class="mb-4">
              <label class="label" for="password">Mot de passe</label>
              <input type="password" id="password" class="input" formControlName="password" placeholder="••••••••" />
              <p class="mt-1 text-xs text-dark-500 dark:text-dark-400">Minimum 8 caractères</p>
            </div>

            <div class="mb-4">
              <label class="label" for="category">Catégorie (optionnel)</label>
              <select id="category" class="input" formControlName="category">
                <option value="">Sélectionner...</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Pro Men">Pro Men</option>
                <option value="Pro Women">Pro Women</option>
                <option value="Doubles">Doubles</option>
              </select>
            </div>

            <button type="submit" class="btn-primary w-full mb-4" [disabled]="registerForm.invalid || isLoading">
              @if (isLoading) {
              <span>Inscription en cours...</span>
              } @else {
              <span>S'inscrire</span>
              }
            </button>

            <p class="text-center text-sm text-hyrox-gray-400">
              Déjà un compte ?
              <a routerLink="/auth/login" class="text-hyrox-yellow hover:text-white font-bold transition-colors">
                Se connecter
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class RegisterPage {
  #authService = inject(AuthService);
  #formBuilder = inject(FormBuilder);

  isLoading = false;
  errorMessage = '';

  registerForm = this.#formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    category: [''],
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.#authService.register(this.registerForm.getRawValue()).subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          // NestJS error format: { statusCode, message } or { error: { message } }
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.error?.message) {
            this.errorMessage = error.error.error.message;
          } else {
            this.errorMessage = error.status === 409 ? 'Cet email est déjà utilisé' : 'Une erreur est survenue lors de l\'inscription';
          }
        },
      });
    }
  }
}


