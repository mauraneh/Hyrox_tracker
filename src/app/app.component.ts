import { Component, OnInit, OnDestroy, inject, effect, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth/auth.service';
import { MessagesService, FollowerNotification } from './core/messages/messages.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <router-outlet />

    @if (followerToast()) {
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-slide-up">
      <div class="flex items-center gap-3 bg-hyrox-gray-900 border border-hyrox-yellow/60 shadow-2xl rounded-xl px-4 py-3 min-w-72 max-w-sm">
        <div class="h-10 w-10 rounded-full overflow-hidden bg-hyrox-gray-800 flex items-center justify-center flex-shrink-0">
          @if (followerToast()!.avatar) {
          <img [src]="followerToast()!.avatar" class="h-full w-full object-cover" alt="" />
          } @else {
          <span class="text-hyrox-yellow font-black text-sm">{{ initials(followerToast()!) }}</span>
          }
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white font-bold text-sm truncate">{{ followerToast()!.firstName }} {{ followerToast()!.lastName }}</p>
          <p class="text-hyrox-gray-400 text-xs">vous suit maintenant</p>
        </div>
        <a [routerLink]="['/search/user', followerToast()!.id]" (click)="dismissToast()" class="text-hyrox-yellow text-xs font-semibold hover:text-white transition-colors flex-shrink-0">
          Voir →
        </a>
        <button (click)="dismissToast()" class="text-hyrox-gray-500 hover:text-white transition-colors ml-1 flex-shrink-0 bg-transparent border-none cursor-pointer p-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    }
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  readonly #router = inject(Router);
  readonly #authService = inject(AuthService);
  readonly #messagesService = inject(MessagesService);

  followerToast = signal<FollowerNotification | null>(null);
  #toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Connect/disconnect WebSocket based on auth state
    effect(() => {
      const token = this.#authService.isAuthenticated()
        ? this.#authService.getToken()
        : null;
      if (token) {
        this.#messagesService.connect(token);
      } else {
        this.#messagesService.disconnect();
      }
    });

    // Show toast when someone follows the current user
    effect(() => {
      const follower = this.#messagesService.newFollower();
      if (follower) {
        this.followerToast.set(follower);
        if (this.#toastTimer) clearTimeout(this.#toastTimer);
        this.#toastTimer = setTimeout(() => this.followerToast.set(null), 5000);
      }
    });
  }

  dismissToast() {
    if (this.#toastTimer) clearTimeout(this.#toastTimer);
    this.followerToast.set(null);
  }

  initials(f: FollowerNotification): string {
    return `${f.firstName?.[0] ?? ''}${f.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  }

  ngOnInit(): void {
    document.addEventListener('mousedown', this.#handleEasterEgg);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this.#handleEasterEgg);
    this.#messagesService.disconnect();
  }

  readonly #handleEasterEgg = (event: MouseEvent): void => {
    if (!event.shiftKey) return;

    // Clic en haut à droite : x > 75% de la largeur ET y < 80px
    const inTopRight =
      event.clientX > window.innerWidth * 0.75 &&
      event.clientY < 80;

    if (inTopRight) {
      this.#router.navigate(['/easter-egg']);
    }
  };
}
