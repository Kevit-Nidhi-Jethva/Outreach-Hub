import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';

interface JwtPayload {
  role?: string;
  exp?: number;
  workspaces?: { role: string }[];
}

interface DecodedToken {
  id?: string;
  email?: string;
  name?: string;
  isAdmin?: boolean;
  role?: string;
  workspaces?: { workspaceId: string; role: string }[];
  exp?: number;
  iat?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/user';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // 🔹 Login and save token
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  // 🔹 Logout and clear token
  logout(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/logout`, {}, { headers }).pipe(
      tap(() => {
        localStorage.removeItem('token');
        this.router.navigate(['/auth/login']);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  // 🔹 Get token
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  // 🔹 Check if user is authenticated and token not expired
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const token = this.getToken();
    if (!token) return false;

    try {
      const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        this.logout().subscribe(); // auto logout if expired
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // auth.service.ts
getUserRole(workspaceId?: string): string | null {
  if (!isPlatformBrowser(this.platformId)) return null;

  const token = this.getToken();
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);

    if (workspaceId && decoded.workspaces) {
      const ws = decoded.workspaces.find(w => w.workspaceId === workspaceId);
      return ws ? ws.role.toLowerCase() : null;
    }

    // fallback → first workspace
    if (decoded.workspaces && decoded.workspaces.length > 0) {
      return decoded.workspaces[0].role.toLowerCase();
    }

    return null;
  } catch {
    return null;
  }
}




  getUserId(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.id || null;
    } catch {
      return null;
    }
  }

  // 🔹 Get username from token
  getUsername(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.name || 'User';
    } catch {
      return null;
    }
  }

getSelectedWorkspaceId(): string | null {
  const data = localStorage.getItem('selectedWorkspace');
  if (!data) return null;
  try {
    const workspaces = JSON.parse(data); // should be array of workspace objects
    return workspaces.length > 0 ? workspaces[0]._id : null;
  } catch (err) {
    console.error('Error parsing workspace data', err);
    return null;
  }
}



}
