import { Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { MessagesService } from './core/messages/messages.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent implements OnInit, OnDestroy {
  readonly #router = inject(Router);
  readonly #authService = inject(AuthService);
  readonly #messagesService = inject(MessagesService);

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
