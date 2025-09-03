import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { WorkspaceStateService } from '../../../core/services/workspace-state.service';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private baseUrl = 'http://localhost:3000/campaigns';

  constructor(private http: HttpClient, private workspaceState: WorkspaceStateService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  createCampaign(campaignData: any): Observable<any> {
    const ws = this.workspaceState.getWorkspaceSync();
    const payload = { ...campaignData, workspaceId: campaignData.workspaceId || ws?.workspaceId };
    return this.http.post(`${this.baseUrl}/create`, payload, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error creating campaign:', error);
        return throwError(() => error);
      })
    );
  }

  getMyCampaigns(): Observable<any> {
    return this.http.get(`${this.baseUrl}/mine`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching my campaigns:', error);
        return throwError(() => error);
      })
    );
  }

  getAllInWorkspace(workspaceId?: string): Observable<any> {
    const ws = workspaceId || this.workspaceState.getWorkspaceSync()?.workspaceId;
    if (!ws) {
      return throwError(() => new Error('No workspace selected'));
    }
    return this.http.get(`${this.baseUrl}/workspace/${ws}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching campaigns:', error);
        return throwError(() => error);
      })
    );
  }

  getCampaignById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching campaign:', error);
        return throwError(() => error);
      })
    );
  }

  updateCampaign(id: string, dto: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, dto, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error updating campaign:', error);
        return throwError(() => error);
      })
    );
  }

  deleteCampaign(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error deleting campaign:', error);
        return throwError(() => error);
      })
    );
  }
}
