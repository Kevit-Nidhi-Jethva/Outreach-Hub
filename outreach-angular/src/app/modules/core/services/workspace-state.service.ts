import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SelectedWorkspace {
  workspaceId: string;
  role: 'Editor' | 'Viewer' | 'admin' | string | null;
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
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  setWorkspace(ws: SelectedWorkspace) {
    try {
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
