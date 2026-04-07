import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

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

@Injectable({ providedIn: 'root' })
export class MessagesService implements OnDestroy {
  #http = inject(HttpClient);
  #base = `${environment.apiUrl}/messages`;
  #socket: Socket | null = null;

  unreadCount = signal(0);
  newMessage = signal<Message | null>(null);

  connect(token: string) {
    if (this.#socket?.connected) return;

    this.#socket = io(`${environment.wsUrl}/messages`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.#socket.on('new_message', (msg: Message) => {
      this.newMessage.set(msg);
      // Increment unread if we're not the sender
      // (exact unread management is done per-conversation)
    });
  }

  disconnect() {
    this.#socket?.disconnect();
    this.#socket = null;
  }

  sendMessage(receiverId: string, content: string) {
    this.#socket?.emit('send_message', { receiverId, content });
  }

  onNewMessage(callback: (msg: Message) => void) {
    this.#socket?.on('new_message', callback);
  }

  offNewMessage(callback: (msg: Message) => void) {
    this.#socket?.off('new_message', callback);
  }

  getConversations(): Observable<{ success: boolean; data: Conversation[] }> {
    return this.#http.get<{ success: boolean; data: Conversation[] }>(`${this.#base}/conversations`);
  }

  getConversation(userId: string): Observable<{ success: boolean; data: Message[] }> {
    return this.#http.get<{ success: boolean; data: Message[] }>(`${this.#base}/${userId}`);
  }

  getUnreadCount(): Observable<{ success: boolean; data: { count: number } }> {
    return this.#http.get<{ success: boolean; data: { count: number } }>(`${this.#base}/unread`);
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
