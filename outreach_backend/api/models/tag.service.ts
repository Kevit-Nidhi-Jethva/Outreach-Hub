import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag } from '../models/tag.model';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  // Adjust if your API endpoint is different
  private apiUrl = 'http://localhost:3000/api/tags';

  constructor(private http: HttpClient) {}

  getTags(workspaceId: string): Observable<Tag[]> {
    const params = new HttpParams().set('workspaceId', workspaceId);
    return this.http.get<Tag[]>(this.apiUrl, { params });
  }
}