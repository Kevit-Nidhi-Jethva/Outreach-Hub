import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private baseUrl = 'http://localhost:3000/user';

  // 🔹 Track selected workspace with BehaviorSubject
  private currentWorkspaceSubject = new BehaviorSubject<any>(this.loadInitialWorkspace());
  currentWorkspace$ = this.currentWorkspaceSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // =======================
  // 🔹 API Calls
  // =======================

  getAllWorkspaces(): Observable<any> {
    return this.http.get(`${this.baseUrl}/my-workspaces`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching workspaces:', error);
        return throwError(() => error);
      })
    );
  }

  getWorkspaceById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching workspace:', error);
        return throwError(() => error);
      })
    );
  }

  createWorkspace(workspaceData: any): Observable<any> {
    return this.http.post(this.baseUrl, workspaceData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error creating workspace:', error);
        return throwError(() => error);
      })
    );
  }

  updateWorkspace(id: string, workspaceData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, workspaceData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error updating workspace:', error);
        return throwError(() => error);
      })
    );
  }

  deleteWorkspace(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error deleting workspace:', error);
        return throwError(() => error);
      })
    );
  }

  getWorkspaceMembers(workspaceId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${workspaceId}/members`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching workspace members:', error);
        return throwError(() => error);
      })
    );
  }

  addWorkspaceMember(workspaceId: string, memberData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${workspaceId}/members`, memberData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error adding workspace member:', error);
        return throwError(() => error);
      })
    );
  }

  removeWorkspaceMember(workspaceId: string, memberId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${workspaceId}/members/${memberId}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error removing workspace member:', error);
        return throwError(() => error);
      })
    );
  }

  // =======================
  // 🔹 Selected Workspace Handling
  // =======================

  private loadInitialWorkspace(): any {
    const saved = localStorage.getItem('selectedWorkspace');
    return saved ? JSON.parse(saved) : null;
  }

  setWorkspace(workspace: any): void {
    localStorage.setItem('selectedWorkspace', JSON.stringify(workspace));
    this.currentWorkspaceSubject.next(workspace); // 🔹 Notify subscribers
  }

  getWorkspace(): any {
    return this.currentWorkspaceSubject.value;
  }

  clearWorkspace(): void {
    localStorage.removeItem('selectedWorkspace');
    this.currentWorkspaceSubject.next(null);
  }
}
