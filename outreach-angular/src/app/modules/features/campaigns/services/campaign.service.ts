import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // ✅ Get all campaigns for the selected workspace
  getCampaigns(): Observable<Campaign[]> {
    const workspaceId = this.authService.getSelectedWorkspaceId();
    if (!workspaceId) return throwError(() => new Error('No workspace selected'));

    return this.http.get<Campaign[]>(`${this.baseUrl}/workspace/${workspaceId}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  // ✅ Get campaign by ID
  getCampaignById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  // ✅ Create campaign (automatically assigns workspaceId if missing)
  createCampaign(data: Campaign): Observable<Campaign> {
    const workspaceId = data.workspaceId || this.authService.getSelectedWorkspaceId();
    if (!workspaceId) return throwError(() => new Error('No workspace selected'));

    return this.http.post<Campaign>(`${this.baseUrl}/create`, { ...data, workspaceId }, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  // ✅ Update campaign
  updateCampaign(id: string, data: Partial<Campaign>): Observable<Campaign> {
    return this.http.patch<Campaign>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  // ✅ Delete campaign
  deleteCampaign(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  // ✅ Copy campaign
  copyCampaign(id: string): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.baseUrl}/${id}/copy`, {}, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  // ✅ Launch campaign
  launchCampaign(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/launch`, {}, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  // ✅ Get campaign status
  getCampaignStatus(id: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.baseUrl}/${id}/status`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }
}
