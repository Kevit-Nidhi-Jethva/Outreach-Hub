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
import { Observable, of } from 'rxjs';

export interface Template {
  id: string;
  name: string;
  content: string;
  createdBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  private dummyTemplates: Template[] = [
    { id: '1', name: 'Welcome Message', content: 'Hello {{name}}, welcome to our platform!', createdBy: 'editor1' },
    { id: '2', name: 'Reminder', content: 'Hi {{name}}, don\'t forget your appointment tomorrow.', createdBy: 'editor2' },
    { id: '3', name: 'Thank You', content: 'Thanks for your purchase, {{name}}!', createdBy: 'editor1' }
  ];

  constructor() { }

  getTemplates(): Observable<Template[]> {
    return of(this.dummyTemplates);
  }

  addTemplate(template: Template): Observable<Template> {
    this.dummyTemplates.push(template);
    return of(template);
  }

  updateTemplate(template: Template): Observable<Template> {
    const index = this.dummyTemplates.findIndex(t => t.id === template.id);
    if (index !== -1) this.dummyTemplates[index] = template;
    return of(template);
  }

  deleteTemplate(id: string): Observable<boolean> {
    this.dummyTemplates = this.dummyTemplates.filter(t => t.id !== id);
    return of(true);
  }
}
