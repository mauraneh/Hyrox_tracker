import { Injectable, inject, signal, computed, OnDestroy, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { FollowService } from '../follows/follow.service';

export interface MessageUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: MessageUser;
}

export interface Conversation {
  partner: MessageUser;
  lastMessage: { content: string; createdAt: string; senderId: string };
  unreadCount: number;
}

export interface FollowerNotification {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface NotificationItem {
  uid: string; // unique per notification event
  follower: FollowerNotification;
  receivedAt: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class MessagesService implements OnDestroy {
  #http = inject(HttpClient);
  #zone = inject(NgZone);
  #followService = inject(FollowService);
  #base = `${environment.apiUrl}/messages`;
  #socket: Socket | null = null;

  unreadCount = signal(0);
  newMessage = signal<Message | null>(null);
  newFollower = signal<FollowerNotification | null>(null);

  notifications = signal<NotificationItem[]>([]);
  unreadNotifCount = computed(() => this.notifications().filter((n) => !n.read).length);

  connect(token: string) {
    if (this.#socket?.connected) return;

    // Nettoyer l'ancienne connexion si elle existe mais est déconnectée
    if (this.#socket) {
      this.#socket.removeAllListeners();
      this.#socket.disconnect();
      this.#socket = null;
    }

    // Établir la connexion en dehors de la zone Angular pour éviter
    // que Socket.IO ne perturbe la détection de changement
    this.#zone.runOutsideAngular(() => {
      this.#socket = io(`${environment.wsUrl}/messages`, {
        auth: { token },
        transports: ['websocket'],
      });

      this.#socket.on('new_message', (msg: Message) => {
        this.#zone.run(() => this.newMessage.set(msg));
      });

      this.#socket.on('new_follower', (follower: FollowerNotification) => {
        this.#zone.run(() => {
          this.newFollower.set(follower);
          this.#addNotification(follower, new Date());
        });
      });

      // Dès que le socket est connecté, fetch les abonnés récents (dernières 24h)
      // pour ne pas rater les notifications arrivées avant la connexion
      this.#socket.on('connect', () => {
        this.#zone.run(() => this.#loadRecentFollowers());
      });
    });
  }

  disconnect() {
    if (this.#socket) {
      this.#socket.removeAllListeners();
      this.#socket.disconnect();
      this.#socket = null;
    }
  }

  sendMessage(receiverId: string, content: string) {
    this.#socket?.emit('send_message', { receiverId, content });
  }

  onNewMessage(callback: (msg: Message) => void) {
    this.#socket?.on('new_message', (msg: Message) => {
      this.#zone.run(() => callback(msg));
    });
  }

  offNewMessage(_callback: (msg: Message) => void) {
    this.#socket?.removeAllListeners('new_message');
    // Ré-enregistrer le handler principal
    this.#socket?.on('new_message', (msg: Message) => {
      this.#zone.run(() => this.newMessage.set(msg));
    });
  }

  getConversations(): Observable<{ success: boolean; data: Conversation[] }> {
    return this.#http.get<{ success: boolean; data: Conversation[] }>(`${this.#base}/conversations`);
  }

  getConversation(userId: string): Observable<{ success: boolean; data: Message[] }> {
    return this.#http.get<{ success: boolean; data: Message[] }>(`${this.#base}/${userId}`);
  }

  markNotificationsRead() {
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  getUnreadCount(): Observable<{ success: boolean; data: { count: number } }> {
    return this.#http.get<{ success: boolean; data: { count: number } }>(`${this.#base}/unread`);
  }

  #addNotification(follower: FollowerNotification, receivedAt: Date) {
    this.notifications.update((list) => {
      // Déduplique : on garde une seule notif par follower
      const filtered = list.filter((n) => n.follower.id !== follower.id);
      return [
        { uid: `${follower.id}-${receivedAt.getTime()}`, follower, receivedAt, read: false },
        ...filtered,
      ];
    });
  }

  #loadRecentFollowers() {
    this.#followService.getRecentFollowers().subscribe({
      next: (res) => {
        res.data.forEach((f) => {
          const follower: FollowerNotification = { id: f.id, firstName: f.firstName, lastName: f.lastName, avatar: f.avatar };
          this.#addNotification(follower, new Date(f.followedAt));
        });
      },
      error: () => {},
    });
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
