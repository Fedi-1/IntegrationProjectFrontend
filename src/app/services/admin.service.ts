import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  UserManagementDTO,
  UpdateRoleRequest,
  SuspendUserRequest,
  AdminResponse,
  UserStatistics
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users with optional filters
   */
  getAllUsers(
    role?: 'ETUDIANT' | 'PARENT' | 'ADMINISTRATOR',
    suspended?: boolean,
    search?: string
  ): Observable<UserManagementDTO[]> {
    let params = new HttpParams();
    
    if (role) {
      params = params.set('role', role);
    }
    if (suspended !== undefined && suspended !== null) {
      params = params.set('suspended', suspended.toString());
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UserManagementDTO[]>(`${this.apiUrl}/users`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<UserManagementDTO> {
    return this.http.get<UserManagementDTO>(`${this.apiUrl}/users/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Suspend or unsuspend a user
   */
  suspendUser(id: number, suspended: boolean): Observable<AdminResponse> {
    const request: SuspendUserRequest = { suspended };
    return this.http.put<AdminResponse>(`${this.apiUrl}/users/${id}/suspend`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update user role
   */
  updateUserRole(id: number, role: 'ETUDIANT' | 'PARENT' | 'ADMINISTRATOR'): Observable<AdminResponse> {
    const request: UpdateRoleRequest = { role };
    return this.http.put<AdminResponse>(`${this.apiUrl}/users/${id}/role`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Observable<AdminResponse> {
    return this.http.delete<AdminResponse>(`${this.apiUrl}/users/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get statistics
   */
  getStatistics(): Observable<AdminResponse> {
    return this.http.get<AdminResponse>(`${this.apiUrl}/statistics`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Error handler
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
