import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SelectedWorkspace {
  workspaceId: string;
  role: 'Editor' | 'Viewer' | 'Admin' | string | null;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceStateService {
  private STORAGE_KEY = 'selectedWorkspace';
  private _workspace$ = new BehaviorSubject<SelectedWorkspace | null>(this.loadFromStorage());

  public workspace$ = this._workspace$.asObservable();

  private loadFromStorage(): SelectedWorkspace | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);

      // Normalize role casing (important!)
      if (parsed.role) {
        parsed.role = String(parsed.role).charAt(0).toUpperCase() + String(parsed.role).slice(1).toLowerCase();
      }

      return parsed;
    } catch {
      return null;
    }
  }

  setWorkspace(ws: SelectedWorkspace) {
    try {
      // Normalize role before saving
      if (ws.role) {
        ws.role = String(ws.role).charAt(0).toUpperCase() + String(ws.role).slice(1).toLowerCase();
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ws));
    } catch {}
    this._workspace$.next(ws);
  }

  clearWorkspace() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {}
    this._workspace$.next(null);
  }

  getWorkspaceSync(): SelectedWorkspace | null {
    return this._workspace$.getValue();
  }
}
