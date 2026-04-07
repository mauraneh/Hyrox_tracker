import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessagesService, Conversation } from 'src/app/core/messages/messages.service';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <nav class="bg-hyrox-gray-900 border-b border-hyrox-gray-800 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-20">
            <div class="flex items-center space-x-8 min-w-0">
              <h1 class="hyrox-title">Hyrox Tracker</h1>
              <nav class="hidden md:flex space-x-6">
                <a routerLink="/dashboard" class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors">Dashboard</a>
                <a routerLink="/search" class="text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors">Recherche</a>
                <a routerLink="/messages" class="text-hyrox-yellow font-bold text-sm uppercase tracking-wide">Messages</a>
              </nav>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 class="text-2xl font-black text-white uppercase tracking-wide mb-6">Messages</h2>

        @if (isLoading()) {
        <div class="space-y-3">
          @for (_ of [1,2,3]; track $index) {
          <div class="card animate-pulse flex items-center gap-4">
            <div class="h-12 w-12 rounded-full bg-hyrox-gray-800 flex-shrink-0"></div>
            <div class="flex-1">
              <div class="h-4 bg-hyrox-gray-800 rounded w-1/3 mb-2"></div>
              <div class="h-3 bg-hyrox-gray-800 rounded w-2/3"></div>
            </div>
          </div>
          }
        </div>
        } @else if (conversations().length === 0) {
        <div class="card text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-hyrox-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
          </svg>
          <p class="text-hyrox-gray-400 font-semibold">Aucune conversation</p>
          <p class="text-hyrox-gray-500 text-sm mt-1">Suivez d'autres athlètes et attendez qu'ils vous suivent en retour pour pouvoir échanger.</p>
          <a routerLink="/search" class="inline-block mt-4 text-hyrox-yellow hover:text-white font-semibold text-sm transition-colors">
            Trouver des athlètes →
          </a>
        </div>
        } @else {
        <div class="space-y-2">
          @for (conv of conversations(); track conv.partner.id) {
          <a
            [routerLink]="['/messages', conv.partner.id]"
            class="card flex items-center gap-4 hover:border-hyrox-yellow/40 transition-colors cursor-pointer no-underline"
          >
            <div class="h-12 w-12 rounded-full overflow-hidden bg-hyrox-gray-800 flex items-center justify-center flex-shrink-0">
              @if (conv.partner.avatar) {
              <img [src]="conv.partner.avatar" [alt]="partnerName(conv)" class="h-full w-full object-cover" />
              } @else {
              <span class="text-hyrox-yellow font-black text-sm">{{ partnerInitials(conv) }}</span>
              }
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p class="font-bold text-white truncate">{{ partnerName(conv) }}</p>
                <span class="text-xs text-hyrox-gray-500 flex-shrink-0">{{ formatDate(conv.lastMessage.createdAt) }}</span>
              </div>
              <p class="text-sm text-hyrox-gray-400 truncate mt-0.5">
                @if (conv.lastMessage.senderId === currentUserId()) {
                <span class="text-hyrox-gray-500">Vous : </span>
                }
                {{ conv.lastMessage.content }}
              </p>
            </div>
            @if (conv.unreadCount > 0) {
            <span class="flex-shrink-0 bg-hyrox-yellow text-black text-xs font-black rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
              {{ conv.unreadCount > 9 ? '9+' : conv.unreadCount }}
            </span>
            }
          </a>
          }
        </div>
        }
      </main>
    </div>
  `,
})
export class MessagesPage implements OnInit {
  #messagesService = inject(MessagesService);
  #authService = inject(AuthService);

  isLoading = signal(true);
  conversations = signal<Conversation[]>([]);

  currentUserId = () => this.#authService.currentUser()?.id ?? '';

  constructor() {
    // Refresh conversations when a new message arrives
    effect(() => {
      const msg = this.#messagesService.newMessage();
      if (msg) this.loadConversations();
    });
  }

  ngOnInit() {
    this.loadConversations();
  }

  private loadConversations() {
    this.#messagesService.getConversations().subscribe({
      next: (res) => {
        this.conversations.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  partnerName(conv: Conversation): string {
    return `${conv.partner.firstName} ${conv.partner.lastName}`.trim();
  }

  partnerInitials(conv: Conversation): string {
    const a = conv.partner.firstName?.[0] ?? '';
    const b = conv.partner.lastName?.[0] ?? '';
    return `${a}${b}`.toUpperCase() || '?';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
