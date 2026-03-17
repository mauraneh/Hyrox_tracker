import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent implements OnInit, OnDestroy {
  readonly #router = inject(Router);

  ngOnInit(): void {
    document.addEventListener('mousedown', this.#handleEasterEgg);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this.#handleEasterEgg);
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
