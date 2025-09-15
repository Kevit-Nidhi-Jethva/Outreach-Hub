import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Template } from '../models/template.model';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  // Adjust if your API endpoint is different
  private apiUrl = 'http://localhost:3000/api/templates';

  constructor(private http: HttpClient) {}

  getTemplates(workspaceId: string): Observable<Template[]> {
    const params = new HttpParams().set('workspaceId', workspaceId);
    return this.http.get<Template[]>(this.apiUrl, { params });
  }
}