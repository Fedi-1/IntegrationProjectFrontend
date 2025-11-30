import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginRequest, SignupRequest, AuthResponse, UserDTO } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<UserDTO | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage if exists
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, request)
      .pipe(
        tap(response => {
          if (response.success && response.user) {
            this.setCurrentUser(response.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          if (response.success && response.user) {
            this.setCurrentUser(response.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userCIN');
    localStorage.removeItem('userRole');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): UserDTO | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isStudent(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ETUDIANT';
  }

  isParent(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'PARENT';
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMINISTRATOR';
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/password/forgot`, { email })
      .pipe(catchError(this.handleError));
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/password/validate-token?token=${token}`)
      .pipe(catchError(this.handleError));
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/password/reset`, { token, newPassword })
      .pipe(catchError(this.handleError));
  }

  private setCurrentUser(user: UserDTO): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userCIN', user.cin); // Store CIN for authorization header
    localStorage.setItem('userRole', user.role); // Store role for frontend guards
    this.currentUserSubject.next(user);
  }

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
