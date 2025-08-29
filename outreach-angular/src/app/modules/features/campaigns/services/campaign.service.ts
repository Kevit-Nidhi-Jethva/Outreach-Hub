import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private baseUrl = 'http://localhost:3000/campaigns';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getAllCampaigns(): Observable<any> {
    return this.http.get(this.baseUrl, { headers: this.getHeaders() }).pipe(
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

  createCampaign(campaignData: any): Observable<any> {
    return this.http.post(this.baseUrl, campaignData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error creating campaign:', error);
        return throwError(() => error);
      })
    );
  }

  updateCampaign(id: string, campaignData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, campaignData, { headers: this.getHeaders() }).pipe(
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
