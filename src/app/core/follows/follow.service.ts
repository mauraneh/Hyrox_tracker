import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isMutual: boolean;
}

export interface FollowUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  category: string | null;
  followedAt: string;
}

@Injectable({ providedIn: 'root' })
export class FollowService {
  #http = inject(HttpClient);
  #base = `${environment.apiUrl}/follows`;

  follow(userId: string): Observable<{ success: boolean; message: string }> {
    return this.#http.post<{ success: boolean; message: string }>(`${this.#base}/${userId}`, {});
  }

  unfollow(userId: string): Observable<{ success: boolean; message: string }> {
    return this.#http.delete<{ success: boolean; message: string }>(`${this.#base}/${userId}`);
  }

  getStatus(userId: string): Observable<{ success: boolean; data: FollowStatus }> {
    return this.#http.get<{ success: boolean; data: FollowStatus }>(`${this.#base}/status/${userId}`);
  }

  getFollowers(): Observable<{ success: boolean; data: FollowUser[] }> {
    return this.#http.get<{ success: boolean; data: FollowUser[] }>(`${this.#base}/me/followers`);
  }

  getFollowing(): Observable<{ success: boolean; data: FollowUser[] }> {
    return this.#http.get<{ success: boolean; data: FollowUser[] }>(`${this.#base}/me/following`);
  }

  getMutual(): Observable<{ success: boolean; data: Omit<FollowUser, 'followedAt'>[] }> {
    return this.#http.get<{ success: boolean; data: Omit<FollowUser, 'followedAt'>[] }>(`${this.#base}/me/mutual`);
  }

  getRecentFollowers(): Observable<{ success: boolean; data: (Omit<FollowUser, 'followedAt'> & { followedAt: string })[] }> {
    return this.#http.get<{ success: boolean; data: (Omit<FollowUser, 'followedAt'> & { followedAt: string })[] }>(`${this.#base}/me/recent-followers`);
  }
}
