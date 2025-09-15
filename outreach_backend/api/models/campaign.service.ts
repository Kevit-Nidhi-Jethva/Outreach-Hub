import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Campaign } from '../models/campaign.model';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  // You should move this to your environment.ts file
  private apiUrl = 'http://localhost:3000/api/campaigns';

  constructor(private http: HttpClient) {}

  /**
   * Get all campaigns for a specific workspace
   * @param workspaceId The ID of the current workspace
   */
  getCampaigns(workspaceId: string): Observable<Campaign[]> {
    const params = new HttpParams().set('workspaceId', workspaceId);
    return this.http.get<Campaign[]>(this.apiUrl, { params });
  }

  /**
   * Get a single campaign by its ID
   * @param id The ID of the campaign
   */
  getCampaignById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new campaign
   * @param campaign The campaign data to create
   */
  createCampaign(campaign: Partial<Campaign>): Observable<Campaign> {
    return this.http.post<Campaign>(this.apiUrl, campaign);
  }

  /**
   * Update an existing campaign
   * @param id The ID of the campaign to update
   * @param campaign The partial campaign data to update
   */
  updateCampaign(id: string, campaign: Partial<Campaign>): Observable<Campaign> {
    return this.http.patch<Campaign>(`${this.apiUrl}/${id}`, campaign);
  }

  // You can add deleteCampaign and other methods here as needed.
}