import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User, AuthResponse } from '../types/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #http = inject(HttpClient);
  #router = inject(Router);

  #currentUser = signal<User | null>(null);
  currentUser = this.#currentUser.asReadonly();

  #isAuthenticated = signal<boolean>(false);
  isAuthenticated = this.#isAuthenticated.asReadonly();

  constructor() {
    this.#checkAuth();
  }

  #checkAuth() {
    const token = this.getToken();
    if (token) {
      this.#isAuthenticated.set(true);
      this.loadCurrentUser();
    }
  }

  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    category?: string;
    weight?: number;
    height?: number;
  }) {
    return this.#http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap((response) => {
        this.#handleAuthSuccess(response);
      }),
    );
  }

  login(email: string, password: string) {
    return this.#http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        this.#handleAuthSuccess(response);
      }),
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.#currentUser.set(null);
    this.#isAuthenticated.set(false);
    this.#router.navigate(['/auth/login']);
  }

  loadCurrentUser() {
    this.#http
      .get<{ success: boolean; data: User }>(`${environment.apiUrl}/auth/me`)
      .subscribe({
        next: (response) => {
          this.#currentUser.set(response.data);
          this.#isAuthenticated.set(true);
        },
        error: () => {
          this.logout();
        },
      });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  #handleAuthSuccess(response: AuthResponse) {
    localStorage.setItem('token', response.data.accessToken);
    this.#currentUser.set(response.data.user);
    this.#isAuthenticated.set(true);
    this.#router.navigate(['/dashboard']);
  }
}


