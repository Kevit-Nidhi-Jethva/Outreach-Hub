import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private baseUrl = 'http://localhost:3000/contacts';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getAllContacts(): Observable<any> {
    return this.http.get(this.baseUrl, { headers: this.getHeaders() }).pipe(
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
    return this.http.post(this.baseUrl, contactData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error creating contact:', error);
        return throwError(() => error);
      })
    );
  }

  updateContact(id: string, contactData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, contactData, { headers: this.getHeaders() }).pipe(
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
    return this.http.post(`${this.baseUrl}/import`, contactsData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error importing contacts:', error);
        return throwError(() => error);
      })
    );
  }
}
