import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getAllUsers(): Observable<any> {
    return this.http.get(this.baseUrl, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching users:', error);
        return throwError(() => error);
      })
    );
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching user:', error);
        return throwError(() => error);
      })
    );
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(this.baseUrl, userData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error creating user:', error);
        return throwError(() => error);
      })
    );
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, userData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error updating user:', error);
        return throwError(() => error);
      })
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error deleting user:', error);
        return throwError(() => error);
      })
    );
  }

  updateUserRole(id: string, roleData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/role`, roleData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error updating user role:', error);
        return throwError(() => error);
      })
    );
  }
}
