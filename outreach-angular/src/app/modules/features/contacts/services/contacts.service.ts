import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WorkspaceStateService } from '../../../core/services/workspace-state.service';

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private baseUrl = 'http://localhost:3000/contacts';

  constructor(private http: HttpClient, private workspaceState: WorkspaceStateService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private ensureWorkspace(): { workspaceId: string } {
    const ws = this.workspaceState.getWorkspaceSync();
    if (!ws?.workspaceId) throw new Error('No workspace selected');
    return ws;
  }

  /** ✅ All contacts in a workspace */
  getWorkspaceContacts(workspaceId?: string): Observable<any> {
    const ws = workspaceId || this.ensureWorkspace().workspaceId;
    return this.http
      .get(`${this.baseUrl}/workspace/${ws}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  /** ✅ Only contacts created by the logged-in user in the current workspace */
  getMyContacts(workspaceId?: string): Observable<any[]> {
    const ws = workspaceId || this.ensureWorkspace().workspaceId;
    return this.http
      .get<any[]>(`${this.baseUrl}/workspace/${ws}/my`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  /** ✅ Create (backend will attach createdBy from JWT) */
  createContact(contactData: any): Observable<any> {
    const ws = this.ensureWorkspace().workspaceId;
    const payload = {
      ...contactData,
      workspaceId: ws,
      tags: Array.isArray(contactData.tags) ? contactData.tags : [],
    };
    return this.http.post(this.baseUrl, payload, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  updateContact(id: string, contactData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, contactData, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  /** Get all unique tags from workspace contacts */
  getTags(): Observable<string[]> {
    return this.getWorkspaceContacts().pipe(
      // Extract tags from contacts and flatten unique tags
      map(contacts => {
        const tagsSet = new Set<string>();
        contacts.forEach((contact: any) => {
          if (Array.isArray(contact.tags)) {
            contact.tags.forEach((tag: string) => tagsSet.add(tag));
          }
        });
        return Array.from(tagsSet);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /** Get all templates - placeholder, adjust as needed */
  getTemplates(): Observable<string[]> {
    // Assuming templates are fetched from a different endpoint or service
    // For now, return empty array observable
    return of([]); 
  }
}
