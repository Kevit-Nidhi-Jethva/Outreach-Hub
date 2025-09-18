import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

export interface CampaignMessage {
  type: 'Text' | 'Text-Image';
  text: string;
  imageUrl?: string;
}

export interface Campaign {
  _id?: string;
  name: string;
  description?: string;
  status?: 'Draft' | 'Running' | 'Completed';
  selectedTags: string[];
  message: CampaignMessage;
  templateId?: string;
  workspaceId?: string;
  createdAt?: string;
  launchedAt?: string;
  messages?: { contactId?: string; messageContent?: string; sentAt?: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private baseUrl = 'http://localhost:3000/campaigns';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getCampaigns(): Observable<Campaign[]> {
    const workspaceId = this.authService.getSelectedWorkspaceId();
    if (!workspaceId) return throwError(() => new Error('No workspace selected'));
    return this.http.get<Campaign[]>(`${this.baseUrl}/workspace/${workspaceId}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  getCampaignsByDate(startDate?: Date, endDate?: Date): Observable<Campaign[]> {
    const workspaceId = this.authService.getSelectedWorkspaceId();
    if (!workspaceId) return throwError(() => new Error('No workspace selected'));
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }
    return this.http.get<Campaign[]>(`${this.baseUrl}/workspace/${workspaceId}`, { headers: this.getHeaders(), params })
      .pipe(catchError(err => throwError(() => err)));
  }

  getCampaignById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

createCampaign(data: Partial<Campaign>): Observable<Campaign> {
  const workspaceId = data.workspaceId || this.authService.getSelectedWorkspaceId();
  if (!workspaceId) return throwError(() => new Error('No workspace selected'));

  const payload = { ...data };

  // Convert launchedAt string to Date string ISO if needed
  if (payload.launchedAt && typeof payload.launchedAt !== 'string') {
    payload.launchedAt = new Date(payload.launchedAt).toISOString();
  }

  return this.http
    .post<Campaign>(`${this.baseUrl}/create`, { ...payload, workspaceId }, { headers: this.getHeaders() })
    .pipe(catchError(err => throwError(() => err)));
}

updateCampaign(id: string, data: Partial<Campaign>): Observable<Campaign> {
  const payload = { ...data };

  // Convert launchedAt string to Date string ISO if needed
  if (payload.launchedAt && typeof payload.launchedAt !== 'string') {
    payload.launchedAt = new Date(payload.launchedAt).toISOString();
  }

  return this.http
    .patch<Campaign>(`${this.baseUrl}/${id}`, payload, { headers: this.getHeaders() })
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
