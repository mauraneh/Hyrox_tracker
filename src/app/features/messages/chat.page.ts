import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessagesService, Message } from 'src/app/core/messages/messages.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { environment } from 'src/environments/environment';

type PartnerInfo = { id: string; firstName: string; lastName: string; avatar: string | null; category: string | null };

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-hyrox-black flex flex-col">
      <!-- Header -->
      <nav class="bg-hyrox-gray-900 border-b border-hyrox-gray-800 shadow-lg flex-shrink-0">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-4 h-16">
            <a routerLink="/messages" class="p-2 rounded-lg text-hyrox-gray-400 hover:text-hyrox-yellow hover:bg-hyrox-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            @if (partner()) {
            <div class="flex items-center gap-3">
              <div class="h-9 w-9 rounded-full overflow-hidden bg-hyrox-gray-800 flex items-center justify-center flex-shrink-0">
                @if (partner()!.avatar) {
                <img [src]="partner()!.avatar!" [alt]="partnerName()" class="h-full w-full object-cover" />
                } @else {
                <span class="text-hyrox-yellow font-black text-xs">{{ partnerInitials() }}</span>
                }
              </div>
              <div>
                <p class="font-bold text-white text-sm">{{ partnerName() }}</p>
                @if (partner()!.category) {
                <p class="text-xs text-hyrox-gray-400">{{ partner()!.category }}</p>
                }
              </div>
            </div>
            } @else {
            <div class="h-5 bg-hyrox-gray-800 rounded w-32 animate-pulse"></div>
            }
          </div>
        </div>
      </nav>

      <!-- Messages area -->
      <div class="flex-1 overflow-y-auto" #messagesContainer>
        <div class="max-w-3xl mx-auto px-4 py-6 space-y-3">
          @if (isLoading()) {
          <div class="flex justify-center py-8">
            <svg class="animate-spin h-6 w-6 text-hyrox-yellow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
          } @else if (messages().length === 0) {
          <div class="text-center py-16">
            <p class="text-hyrox-gray-400">Aucun message pour l'instant.</p>
            <p class="text-hyrox-gray-500 text-sm mt-1">Envoyez le premier message !</p>
          </div>
          } @else {
          @for (msg of messages(); track msg.id) {
            @if (msg.senderId === currentUserId()) {
            <!-- Mes messages : droite, jaune -->
            <div class="flex justify-end items-end gap-2">
              <div class="max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl rounded-br-none bg-hyrox-yellow text-black shadow-md">
                <p class="text-sm break-words leading-relaxed">{{ msg.content }}</p>
                <p class="text-xs mt-1 text-black/50 text-right">{{ formatTime(msg.createdAt) }}</p>
              </div>
            </div>
            } @else {
            <!-- Messages du partenaire : gauche, gris -->
            <div class="flex justify-start items-end gap-2">
              <div class="h-7 w-7 rounded-full overflow-hidden bg-hyrox-gray-700 flex items-center justify-center flex-shrink-0 mb-0.5">
                @if (partner()?.avatar) {
                <img [src]="partner()!.avatar!" class="h-full w-full object-cover" alt="" />
                } @else {
                <span class="text-hyrox-yellow font-black text-xs">{{ partnerInitials() }}</span>
                }
              </div>
              <div class="max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl rounded-bl-none bg-hyrox-gray-800 text-white shadow-md">
                <p class="text-sm break-words leading-relaxed">{{ msg.content }}</p>
                <p class="text-xs mt-1 text-hyrox-gray-500 text-right">{{ formatTime(msg.createdAt) }}</p>
              </div>
            </div>
            }
          }
          }
        </div>
      </div>

      <!-- Input area -->
      <div class="bg-hyrox-gray-900 border-t border-hyrox-gray-800 flex-shrink-0">
        <div class="max-w-3xl mx-auto px-4 py-3">
          <form (ngSubmit)="sendMessage()" class="flex items-center gap-3">
            <input
              [(ngModel)]="messageText"
              name="message"
              type="text"
              placeholder="Votre message..."
              maxlength="1000"
              autocomplete="off"
              class="flex-1 bg-hyrox-gray-800 text-white placeholder-hyrox-gray-500 rounded-xl px-4 py-2.5 text-sm border border-hyrox-gray-700 focus:outline-none focus:border-hyrox-yellow transition-colors"
            />
            <button
              type="submit"
              [disabled]="!messageText.trim() || sending()"
              class="flex-shrink-0 bg-hyrox-yellow text-black font-bold rounded-xl px-4 py-2.5 text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class ChatPage implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  #route = inject(ActivatedRoute);
  #http = inject(HttpClient);
  #messagesService = inject(MessagesService);
  #authService = inject(AuthService);

  isLoading = signal(true);
  messages = signal<Message[]>([]);
  partner = signal<PartnerInfo | null>(null);
  sending = signal(false);
  messageText = '';

  #partnerId = '';
  #shouldScrollToBottom = false;
  #messageHandler = (msg: Message) => this.#onNewMessage(msg);

  currentUserId = () => this.#authService.currentUser()?.id ?? '';

  ngOnInit() {
    this.#route.paramMap.subscribe((params) => {
      this.#partnerId = params.get('id') ?? '';
      if (this.#partnerId) {
        this.loadPartner();
        this.loadMessages();
        this.#messagesService.onNewMessage(this.#messageHandler);
      }
    });
  }

  ngOnDestroy() {
    this.#messagesService.offNewMessage(this.#messageHandler);
  }

  ngAfterViewChecked() {
    if (this.#shouldScrollToBottom) {
      this.#scrollToBottom();
      this.#shouldScrollToBottom = false;
    }
  }

  #scrollToBottom() {
    const el = this.messagesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  #onNewMessage(msg: Message) {
    const isRelevant =
      (msg.senderId === this.currentUserId() && msg.receiverId === this.#partnerId) ||
      (msg.senderId === this.#partnerId && msg.receiverId === this.currentUserId());
    if (isRelevant) {
      this.messages.update((msgs) => {
        if (msgs.find((m) => m.id === msg.id)) return msgs;
        return [...msgs, msg];
      });
      this.#shouldScrollToBottom = true;
    }
  }

  private loadPartner() {
    this.#http
      .get<{ success: boolean; data: { user: PartnerInfo } }>(`${environment.apiUrl}/users/public/${this.#partnerId}`)
      .subscribe({
        next: (res) => this.partner.set(res.data.user),
        error: () => {},
      });
  }

  private loadMessages() {
    this.isLoading.set(true);
    this.#messagesService.getConversation(this.#partnerId).subscribe({
      next: (res) => {
        this.messages.set(res.data);
        this.isLoading.set(false);
        this.#shouldScrollToBottom = true;
        // Messages marqués comme lus côté serveur → rafraîchir le compteur
        this.#messagesService.getUnreadCount().subscribe({
          next: (r) => this.#messagesService.unreadCount.set(r.data.count),
          error: () => {},
        });
      },
      error: () => this.isLoading.set(false),
    });
  }

  sendMessage() {
    const text = this.messageText.trim();
    if (!text || this.sending()) return;
    this.sending.set(true);
    this.messageText = '';
    this.#messagesService.sendMessage(this.#partnerId, text);
    // Message will appear via the socket 'new_message' event
    setTimeout(() => this.sending.set(false), 300);
  }

  partnerName(): string {
    const p = this.partner();
    if (!p) return '';
    return `${p.firstName} ${p.lastName}`.trim();
  }

  partnerInitials(): string {
    const p = this.partner();
    if (!p) return '?';
    return `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
