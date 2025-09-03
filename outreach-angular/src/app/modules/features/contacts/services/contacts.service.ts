import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { WorkspaceStateService } from '../../../core/services/workspace-state.service';

@Injectable({
  providedIn: 'root'
})
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

  // Fetch all contacts for selected workspace
  getAllContacts(): Observable<any> {
    const ws = this.workspaceState.getWorkspaceSync();
    if (!ws?.workspaceId) {
      return throwError(() => new Error('No workspace selected'));
    }
    return this.http.get(`${this.baseUrl}/workspace/${ws.workspaceId}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching contacts:', error);
        return throwError(() => error);
      })
    );
  }

  getContactById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching contact:', error);
        return throwError(() => error);
      })
    );
  }

  createContact(contactData: any): Observable<any> {
    const ws = this.workspaceState.getWorkspaceSync();
    const payload = { ...contactData, workspaceId: contactData.workspaceId || ws?.workspaceId };
    return this.http.post(this.baseUrl, payload, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error creating contact:', error);
        return throwError(() => error);
      })
    );
  }

  updateContact(id: string, contactData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, contactData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error updating contact:', error);
        return throwError(() => error);
      })
    );
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error deleting contact:', error);
        return throwError(() => error);
      })
    );
  }

  importContacts(contactsData: any[]): Observable<any> {
    const ws = this.workspaceState.getWorkspaceSync();
    const payload = contactsData.map(c => ({ ...c, workspaceId: c.workspaceId || ws?.workspaceId }));
    return this.http.post(`${this.baseUrl}/import`, payload, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error importing contacts:', error);
        return throwError(() => error);
      })
    );
  }
}
