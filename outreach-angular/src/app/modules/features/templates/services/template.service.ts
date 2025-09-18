// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, catchError, throwError } from 'rxjs';
// import { WorkspaceStateService } from '../../../core/services/workspace-state.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class TemplateService {
//   private baseUrl = 'http://localhost:3000/templates';

//   constructor(private http: HttpClient, private workspaceState: WorkspaceStateService) {}

//   private getHeaders(): HttpHeaders {
//     const token = localStorage.getItem('token');
//     let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     if (token) {
//       headers = headers.set('Authorization', `Bearer ${token}`);
//     }
//     return headers;
//   }

//   getAllTemplates(): Observable<any> {
//     const ws = this.workspaceState.getWorkspaceSync();
//     if (!ws?.workspaceId) {
//       return throwError(() => new Error('No workspace selected'));
//     }
//     return this.http.get(`${this.baseUrl}/workspace/${ws.workspaceId}`, { headers: this.getHeaders() }).pipe(
//       catchError((error) => {
//         console.error('Error fetching templates:', error);
//         return throwError(() => error);
//       })
//     );
//   }

//   getTemplateById(id: string): Observable<any> {
//     return this.http.get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
//       catchError((error) => {
//         console.error('Error fetching template:', error);
//         return throwError(() => error);
//       })
//     );
//   }

//   createTemplate(data: any): Observable<any> {
//     const ws = this.workspaceState.getWorkspaceSync();
//     const payload = { ...data, workspaceId: data.workspaceId || ws?.workspaceId };
//     return this.http.post(this.baseUrl, payload, { headers: this.getHeaders() }).pipe(
//       catchError((error) => {
//         console.error('Error creating template:', error);
//         return throwError(() => error);
//       })
//     );
//   }

//   updateTemplate(id: string, data: any): Observable<any> {
//     return this.http.put(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() }).pipe(
//       catchError((error) => {
//         console.error('Error updating template:', error);
//         return throwError(() => error);
//       })
//     );
//   }

//   deleteTemplate(id: string): Observable<any> {
//     return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
//       catchError((error) => {
//         console.error('Error deleting template:', error);
//         return throwError(() => error);
//       })
//     );
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WorkspaceStateService } from '../../../core/services/workspace-state.service';
import { AuthService } from '../../../core/services/auth.service';

export interface Template {
  _id: string; // backend field
  name: string;
  type: 'Text' | 'Text-Image';
  message: {
    text: string;
    imageUrl?: string;
  };
  workspaceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private baseUrl = 'http://localhost:3000/messages';

  constructor(
    private http: HttpClient,
    private workspaceState: WorkspaceStateService,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // ✅ Get all templates for current workspace
  getTemplates(): Observable<Template[]> {
    const ws = this.workspaceState.getWorkspaceSync();
    if (!ws?.workspaceId) return throwError(() => new Error('No workspace selected'));

    return this.http
      .get<Template[]>(`${this.baseUrl}/workspace/${ws.workspaceId}/templates`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map(templates =>
          templates.map(t => ({
            ...t,
            _id: t._id || (t as any).id // normalize if backend ever returns id
          }))
        ),
        catchError(err => throwError(() => err))
      );
  }

  // ✅ Get templates by date range
  getTemplatesByDate(startDate?: Date, endDate?: Date): Observable<Template[]> {
    const ws = this.workspaceState.getWorkspaceSync();
    if (!ws?.workspaceId) return throwError(() => new Error('No workspace selected'));

    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http
      .get<Template[]>(`${this.baseUrl}/workspace/${ws.workspaceId}/templates`, {
        headers: this.getHeaders(),
        params
      })
      .pipe(
        map(templates =>
          templates.map(t => ({
            ...t,
            _id: t._id || (t as any).id // normalize if backend ever returns id
          }))
        ),
        catchError(err => throwError(() => err))
      );
  }

  // ✅ Create template
  createTemplate(data: Partial<Template>): Observable<Template> {
    const ws = this.workspaceState.getWorkspaceSync();
    if (!ws?.workspaceId) return throwError(() => new Error('No workspace selected'));

    const payload = { ...data, workspaceId: ws.workspaceId };
    return this.http
      .post<Template>(`${this.baseUrl}/create`, payload, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  // ✅ Update template by _id
  updateTemplate(template: Template): Observable<Template> {
    return this.http
      .put<Template>(`${this.baseUrl}/update/${template._id}`, template, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  // ✅ Delete template by _id
  deleteTemplate(id: string): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/delete/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }
}

