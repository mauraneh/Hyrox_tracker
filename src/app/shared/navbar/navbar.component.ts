import { Component, Input, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { MessagesService } from 'src/app/core/messages/messages.service';

export type NavPage = 'dashboard' | 'courses' | 'trainings' | 'stats' | 'search' | 'messages' | 'profile' | 'settings' | 'other';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-hyrox-gray-900 border-b border-hyrox-gray-800 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex items-center space-x-8 min-w-0">
            <h1 class="hyrox-title">Hyrox Tracker</h1>
            <nav class="hidden md:flex space-x-6">
              <a routerLink="/dashboard" [class]="linkClass('dashboard')">Dashboard</a>
              <a routerLink="/courses" [class]="linkClass('courses')">Courses</a>
              <a routerLink="/trainings" [class]="linkClass('trainings')">Entraînements</a>
              <a routerLink="/stats" [class]="linkClass('stats')">Statistiques</a>
            </nav>
          </div>

          <div class="flex items-center space-x-2">
            <!-- Lien Messages avec badge -->
            <a
              routerLink="/messages"
              class="relative p-2 rounded-lg transition-colors"
              [class]="activePage === 'messages'
                ? 'text-hyrox-yellow bg-hyrox-gray-800'
                : 'text-hyrox-gray-400 hover:text-hyrox-yellow hover:bg-hyrox-gray-800'"
              aria-label="Messages"
              title="Messages"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
              </svg>
              @if (unreadCount() > 0) {
              <span class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-black rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">
                {{ unreadCount() > 9 ? '9+' : unreadCount() }}
              </span>
              }
            </a>

            <!-- Cloche notifications -->
            <div class="relative notif-container">
              <button
                (click)="toggleNotifPanel($event)"
                class="relative p-2 rounded-lg transition-colors"
                [class]="showNotifPanel()
                  ? 'text-hyrox-yellow bg-hyrox-gray-800'
                  : 'text-hyrox-gray-400 hover:text-hyrox-yellow hover:bg-hyrox-gray-800'"
                aria-label="Notifications"
                title="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                @if (unreadNotifCount() > 0) {
                <span class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-black rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">
                  {{ unreadNotifCount() > 9 ? '9+' : unreadNotifCount() }}
                </span>
                }
              </button>

              @if (showNotifPanel()) {
              <div class="absolute right-0 mt-2 w-80 bg-hyrox-gray-900 rounded-xl shadow-2xl border border-hyrox-gray-800 z-50 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-3 border-b border-hyrox-gray-800">
                  <span class="text-sm font-bold text-white uppercase tracking-wide">Notifications</span>
                  @if (unreadNotifCount() > 0) {
                  <button (click)="markAllRead()" class="text-xs text-hyrox-yellow hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                    Tout marquer lu
                  </button>
                  }
                </div>
                <div class="max-h-80 overflow-y-auto">
                  @if (notifications().length === 0) {
                  <div class="px-4 py-8 text-center text-hyrox-gray-500 text-sm">Aucune notification</div>
                  } @else {
                  @for (notif of notifications(); track notif.uid) {
                  <button
                    (click)="goToProfile(notif.follower.id)"
                    class="w-full flex items-center gap-3 px-4 py-3 hover:bg-hyrox-gray-800 transition-colors text-left cursor-pointer bg-transparent border-none border-b border-hyrox-gray-800/50"
                    [class.opacity-60]="notif.read"
                  >
                    <div class="h-9 w-9 rounded-full overflow-hidden bg-hyrox-gray-700 flex items-center justify-center flex-shrink-0">
                      @if (notif.follower.avatar) {
                      <img [src]="notif.follower.avatar" class="h-full w-full object-cover" alt="" />
                      } @else {
                      <span class="text-hyrox-yellow font-black text-xs">{{ notifInitials(notif.follower) }}</span>
                      }
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-white text-sm font-semibold truncate">{{ notif.follower.firstName }} {{ notif.follower.lastName }}</p>
                      <p class="text-hyrox-gray-400 text-xs">a commencé à vous suivre</p>
                      <p class="text-hyrox-gray-600 text-xs mt-0.5">{{ formatNotifTime(notif.receivedAt) }}</p>
                    </div>
                    @if (!notif.read) {
                    <span class="h-2 w-2 rounded-full bg-hyrox-yellow flex-shrink-0"></span>
                    }
                  </button>
                  }
                  }
                </div>
              </div>
              }
            </div>

            <!-- Recherche -->
            <a
              routerLink="/search"
              class="p-2 rounded-lg transition-colors"
              [class]="activePage === 'search'
                ? 'text-hyrox-yellow bg-hyrox-gray-800'
                : 'text-hyrox-gray-400 hover:text-hyrox-yellow hover:bg-hyrox-gray-800'"
              aria-label="Rechercher des utilisateurs"
              title="Recherche"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </a>

            <!-- Menu utilisateur -->
            <div class="relative user-menu-container">
              <button
                (click)="toggleMenu($event)"
                (keydown.enter)="toggleMenu($event)"
                class="flex items-center space-x-2 text-sm text-white hover:text-hyrox-yellow cursor-pointer font-semibold transition-colors bg-transparent border-none p-2 rounded-lg hover:bg-hyrox-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="hidden sm:inline">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (showMenu()) {
              <div class="absolute right-0 mt-2 w-52 bg-hyrox-gray-900 rounded-lg shadow-xl border-2 border-hyrox-yellow py-1 z-50">
                <a routerLink="/profile" (click)="closeMenu()" class="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-hyrox-gray-800 hover:text-hyrox-yellow transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil
                </a>
                <a routerLink="/settings" (click)="closeMenu()" class="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-hyrox-gray-800 hover:text-hyrox-yellow transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Paramètres
                </a>
                <div class="border-t border-hyrox-gray-800 my-1"></div>
                <button (click)="logout()" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </button>
              </div>
              }
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() activePage: NavPage = 'other';

  #authService = inject(AuthService);
  #messagesService = inject(MessagesService);
  #router = inject(Router);

  currentUser = this.#authService.currentUser;
  showMenu = signal(false);
  showNotifPanel = signal(false);
  unreadCount = this.#messagesService.unreadCount;
  unreadNotifCount = this.#messagesService.unreadNotifCount;
  notifications = this.#messagesService.notifications;

  #clickListener = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (this.showMenu() && !target.closest('.user-menu-container')) {
      this.closeMenu();
    }
    if (this.showNotifPanel() && !target.closest('.notif-container')) {
      this.closeNotifPanel();
    }
  };

  constructor() {
    // Incrémenter le badge dès qu'un message arrive via WebSocket
    effect(() => {
      const msg = this.#messagesService.newMessage();
      if (msg) {
        const currentUserId = this.#authService.currentUser()?.id;
        if (msg.receiverId === currentUserId) {
          this.#messagesService.unreadCount.update((n) => n + 1);
        }
      }
    });
  }

  ngOnInit() {
    document.addEventListener('click', this.#clickListener);
    this.#loadUnreadCount();
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.#clickListener);
  }

  #loadUnreadCount() {
    this.#messagesService.getUnreadCount().subscribe({
      next: (res) => this.#messagesService.unreadCount.set(res.data.count),
      error: () => {},
    });
  }

  linkClass(page: NavPage): string {
    return this.activePage === page
      ? 'text-hyrox-yellow font-bold text-sm uppercase tracking-wide hover:text-white transition-colors'
      : 'text-hyrox-gray-400 hover:text-hyrox-yellow font-semibold text-sm uppercase tracking-wide transition-colors';
  }

  toggleMenu(event?: Event) {
    event?.stopPropagation();
    this.showMenu.update((v) => !v);
    if (this.showNotifPanel()) this.closeNotifPanel();
  }

  closeMenu() {
    this.showMenu.set(false);
  }

  markAllRead() {
    this.#messagesService.markNotificationsRead();
  }

  toggleNotifPanel(event?: Event) {
    event?.stopPropagation();
    const opening = !this.showNotifPanel();
    this.showNotifPanel.set(opening);
    if (opening) {
      this.closeMenu();
      this.#messagesService.markNotificationsRead();
    }
  }

  closeNotifPanel() {
    this.showNotifPanel.set(false);
  }

  goToProfile(userId: string) {
    this.closeNotifPanel();
    this.#router.navigate(['/search/user', userId]);
  }

  notifInitials(f: { firstName: string; lastName: string }): string {
    return `${f.firstName?.[0] ?? ''}${f.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  }

  formatNotifTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  logout() {
    this.closeMenu();
    this.#authService.logout();
  }
}
