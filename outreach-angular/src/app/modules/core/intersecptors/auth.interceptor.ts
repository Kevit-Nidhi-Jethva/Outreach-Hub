import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { WorkspaceStateService } from '../services/workspace-state.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private workspaceState: WorkspaceStateService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const selected = this.workspaceState.getWorkspaceSync();

    let clonedReq = req;

    if (token) {
      clonedReq = clonedReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // add workspace id header if selected (do not modify body/params automatically)
    if (selected?.workspaceId) {
      clonedReq = clonedReq.clone({
        setHeaders: {
          ...clonedReq.headers.keys().reduce((acc: any, k: string) => ({ ...acc, [k]: clonedReq.headers.get(k) }), {}),
          'x-workspace-id': selected.workspaceId
        }
      });
    }

    return next.handle(clonedReq);
  }
}
