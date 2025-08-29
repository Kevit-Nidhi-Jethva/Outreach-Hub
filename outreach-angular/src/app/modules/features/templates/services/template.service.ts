import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private baseUrl = 'http://localhost:3000/templates';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getAllTemplates(): Observable<any> {
    return this.http.get(this.baseUrl, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching templates:', error);
        return throwError(() => error);
      })
    );
  }

  getTemplateById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching template:', error);
        return throwError(() => error);
      })
    );
  }

  createTemplate(templateData: any): Observable<any> {
    return this.http.post(this.baseUrl, templateData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error creating template:', error);
        return throwError(() => error);
      })
    );
  }

  updateTemplate(id: string, templateData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, templateData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error updating template:', error);
        return throwError(() => error);
      })
    );
  }

  deleteTemplate(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error deleting template:', error);
        return throwError(() => error);
      })
    );
  }
}
