import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
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
              <div class="relative">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  id="password" 
                  class="input pr-10" 
                  formControlName="password" 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-hyrox-gray-400 hover:text-hyrox-yellow transition-colors focus:outline-none"
                  aria-label="Afficher/masquer le mot de passe"
                >
                  @if (showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                </button>
              </div>
              <p class="mt-1 text-xs text-hyrox-gray-500">Minimum 8 caractères</p>
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
  showPassword = signal(false);

  registerForm = this.#formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    category: [''],
  });

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

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


