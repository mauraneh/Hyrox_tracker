import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, effect, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessagesService, Conversation } from 'src/app/core/messages/messages.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { FollowService, FollowUser } from 'src/app/core/follows/follow.service';
import { NavbarComponent } from 'src/app/shared/navbar/navbar.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-hyrox-black">
      <app-navbar activePage="messages" />

      <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-black text-white uppercase tracking-wide">Messages</h2>
          <button
            (click)="openNewModal()"
            class="flex items-center gap-2 bg-hyrox-yellow text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Nouveau
          </button>
        </div>

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

    <!-- Modale Nouveau message -->
    @if (showNewModal()) {
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" (click)="closeNewModal()">
      <div class="bg-hyrox-gray-900 border border-hyrox-gray-800 rounded-2xl w-full max-w-md shadow-2xl" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-5 border-b border-hyrox-gray-800">
          <h3 class="text-lg font-black text-white uppercase tracking-wide">Nouvelle conversation</h3>
          <button (click)="closeNewModal()" class="text-hyrox-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-4">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Rechercher un abonné mutuel..."
            class="w-full bg-hyrox-gray-800 border border-hyrox-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-hyrox-gray-500 focus:outline-none focus:border-hyrox-yellow transition-colors"
          />
        </div>

        <div class="max-h-72 overflow-y-auto px-2 pb-4">
          @if (isLoadingMutuals()) {
          <div class="text-center py-8 text-hyrox-gray-500 text-sm">Chargement...</div>
          } @else if (filteredMutuals().length === 0) {
          <div class="text-center py-8 text-hyrox-gray-500 text-sm">
            @if (searchQuery) { Aucun résultat } @else { Aucun abonné mutuel }
          </div>
          } @else {
          @for (user of filteredMutuals(); track user.id) {
          <button
            (click)="startConversation(user.id)"
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-hyrox-gray-800 transition-colors text-left cursor-pointer bg-transparent border-none"
          >
            <div class="h-10 w-10 rounded-full overflow-hidden bg-hyrox-gray-700 flex items-center justify-center flex-shrink-0">
              @if (user.avatar) {
              <img [src]="user.avatar" class="h-full w-full object-cover" alt="" />
              } @else {
              <span class="text-hyrox-yellow font-black text-sm">{{ mutualInitials(user) }}</span>
              }
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-semibold text-sm truncate">{{ user.firstName }} {{ user.lastName }}</p>
              @if (user.category) {
              <p class="text-hyrox-gray-500 text-xs truncate">{{ user.category }}</p>
              }
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-hyrox-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          }
          }
        </div>
      </div>
    </div>
    }
  `,
})
export class MessagesPage implements OnInit {
  #messagesService = inject(MessagesService);
  #authService = inject(AuthService);
  #followService = inject(FollowService);
  #router = inject(Router);

  isLoading = signal(true);
  conversations = signal<Conversation[]>([]);

  showNewModal = signal(false);
  isLoadingMutuals = signal(false);
  mutuals = signal<Omit<FollowUser, 'followedAt'>[]>([]);
  searchQuery = '';

  filteredMutuals = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.mutuals();
    return this.mutuals().filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q),
    );
  });

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

  openNewModal() {
    this.searchQuery = '';
    this.showNewModal.set(true);
    this.isLoadingMutuals.set(true);
    this.#followService.getMutual().subscribe({
      next: (res) => {
        this.mutuals.set(res.data);
        this.isLoadingMutuals.set(false);
      },
      error: () => this.isLoadingMutuals.set(false),
    });
  }

  closeNewModal() {
    this.showNewModal.set(false);
  }

  startConversation(userId: string) {
    this.closeNewModal();
    this.#router.navigate(['/messages', userId]);
  }

  mutualInitials(user: Omit<FollowUser, 'followedAt'>): string {
    return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';
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
