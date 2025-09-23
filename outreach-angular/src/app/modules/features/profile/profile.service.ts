import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  lastLogin?: Date;
  twoFactorEnabled: boolean;
  avatar?: string;
}

export interface UserPreferences {
  theme: string;
  language: string;
  emailNotifications: boolean;
  timezone: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Get user profile
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching user profile:', error);
          return throwError(() => error);
        })
      );
  }

  // Update user profile
  updateProfile(profileData: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/profile`, profileData, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error updating profile:', error);
          return throwError(() => error);
        })
      );
  }

  // Change password
  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/change-password`, passwordData, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error changing password:', error);
          return throwError(() => error);
        })
      );
  }

  // Toggle two-factor authentication
  toggleTwoFactor(): Observable<any> {
    return this.http.put(`${this.baseUrl}/toggle-2fa`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error toggling 2FA:', error);
          return throwError(() => error);
        })
      );
  }

  // Get user preferences
  getUserPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${this.baseUrl}/preferences`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching user preferences:', error);
          // Return default preferences if API fails
          return throwError(() => error);
        })
      );
  }

  // Update user preferences
  updatePreferences(preferences: UserPreferences): Observable<UserPreferences> {
    return this.http.put<UserPreferences>(`${this.baseUrl}/preferences`, preferences, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error updating preferences:', error);
          return throwError(() => error);
        })
      );
  }

  // Get workspace member count
  getWorkspaceMemberCount(workspaceId: string): Observable<number> {
    return this.http.get<{ memberCount: number }>(`${this.baseUrl}/workspace/${workspaceId}/members/count`, { headers: this.getHeaders() })
      .pipe(
        map(response => response.memberCount),
        catchError(error => {
          console.error('Error fetching workspace member count:', error);
          return throwError(() => error);
        })
      );
  }
}
