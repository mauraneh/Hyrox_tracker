import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-easter-egg',
  standalone: true,
  template: `
    <div
      class="min-h-screen bg-hyrox-black flex flex-col items-center justify-center px-4 cursor-pointer relative overflow-hidden"
      (click)="goBack()"
    >
      <!-- Confettis décoratifs -->
      <div class="absolute inset-0 pointer-events-none">
        @for (item of confetti; track $index) {
          <span
            class="absolute text-2xl animate-bounce"
            [style.left]="item.x"
            [style.top]="item.y"
            [style.animation-delay]="item.delay"
          >{{ item.emoji }}</span>
        }
      </div>

      <div class="relative z-10 flex flex-col items-center text-center max-w-lg">
        <!-- Badge -->
        <div class="mb-6 px-4 py-1 rounded-full border border-hyrox-yellow/40 bg-hyrox-yellow/10 text-hyrox-yellow text-xs font-semibold uppercase tracking-widest">
          Easter Egg débloqué 🎉
        </div>

        <!-- Photo avec halo jaune -->
        <div class="relative mb-8">
          <div class="absolute -inset-2 rounded-2xl bg-gradient-to-br from-hyrox-yellow to-yellow-300 opacity-40 blur-md"></div>
          <img
            src="easter-egg.png"
            alt="Easter Egg"
            class="relative w-72 rounded-2xl shadow-2xl border-2 border-hyrox-yellow/60"
          />
        </div>

        <!-- Texte principal -->
        <h1 class="text-4xl font-black text-hyrox-yellow uppercase tracking-wide mb-4 leading-tight">
          Bravo tu as trouvé l'Easter Egg
        </h1>
        <p class="text-hyrox-gray-400 text-sm mt-2">
          Tu fais partie des rares élus... 🐣
        </p>
        <p class="text-hyrox-gray-600 text-xs mt-6">
          Clique n'importe où pour revenir au dashboard
        </p>
      </div>
    </div>
  `,
})
export class EasterEggPage {
  readonly #router = inject(Router);

  readonly confetti = [
    { x: '5%',  y: '10%', emoji: '🥚', delay: '0s'   },
    { x: '15%', y: '25%', emoji: '🐣', delay: '0.3s' },
    { x: '80%', y: '8%',  emoji: '🥚', delay: '0.6s' },
    { x: '90%', y: '30%', emoji: '🐰', delay: '0.1s' },
    { x: '70%', y: '70%', emoji: '🌸', delay: '0.4s' },
    { x: '10%', y: '75%', emoji: '🌸', delay: '0.7s' },
    { x: '50%', y: '5%',  emoji: '✨', delay: '0.2s' },
    { x: '35%', y: '85%', emoji: '🐣', delay: '0.5s' },
    { x: '88%', y: '80%', emoji: '🥚', delay: '0.9s' },
    { x: '25%', y: '50%', emoji: '🎉', delay: '0.8s' },
  ];

  goBack(): void {
    this.#router.navigate(['/dashboard']);
  }
}
