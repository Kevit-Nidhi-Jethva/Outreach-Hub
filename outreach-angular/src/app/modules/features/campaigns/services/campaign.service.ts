import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CampaignMessage {
  type: 'Text' | 'Text-Image';
  text: string;
  imageUrl?: string;
}

export interface Campaign {
  _id?: string;
  name: string;
  description?: string;
  status: 'Draft' | 'Running' | 'Completed';
  selectedTags: string[];
  message: CampaignMessage;
  templateId?: string;
  workspaceId: string;
  createdAt?: string;
  launchedAt?: string;
  messages?: { contactId?: string; messageContent?: string; sentAt?: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private baseUrl = 'http://localhost:3000/campaigns';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // List campaigns in workspace
  getCampaigns(workspaceId: string): Observable<Campaign[]> {
    if (!workspaceId) workspaceId = localStorage.getItem('selectedWorkspaceId') || '';
    return this.http.get<Campaign[]>(`${this.baseUrl}/workspace/${workspaceId}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  getCampaignById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  createCampaign(data: Campaign): Observable<Campaign> {
    const wsId = data.workspaceId || localStorage.getItem('selectedWorkspaceId') || '';
    const payload = { ...data, workspaceId: wsId };
    return this.http.post<Campaign>(`${this.baseUrl}/create`, payload, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  updateCampaign(id: string, data: Partial<Campaign>): Observable<Campaign> {
    return this.http.patch<Campaign>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  deleteCampaign(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  copyCampaign(id: string): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.baseUrl}/${id}/copy`, {}, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  launchCampaign(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/launch`, {}, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  getCampaignStatus(id: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.baseUrl}/${id}/status`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }
}
