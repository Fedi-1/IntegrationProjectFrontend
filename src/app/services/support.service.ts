import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  SupportTicket,
  SupportMessage,
  CreateTicketRequest,
  SendMessageRequest,
  UpdateTicketStatusRequest,
  TicketStatus,
  TicketPriority
} from '../models/support.model';
import { AdminResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private apiUrl = `${environment.apiUrl}/api/support`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new support ticket
   */
  createTicket(userId: number, request: CreateTicketRequest): Observable<AdminResponse> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<AdminResponse>(`${this.apiUrl}/tickets`, request, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all tickets for a user
   */
  getUserTickets(userId: number): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.apiUrl}/tickets/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all tickets (admin)
   */
  getAllTickets(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.apiUrl}/tickets`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get tickets by status
   */
  getTicketsByStatus(status: TicketStatus): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.apiUrl}/tickets/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get ticket by ID with messages
   */
  getTicketById(ticketId: number): Observable<SupportTicket> {
    return this.http.get<SupportTicket>(`${this.apiUrl}/tickets/${ticketId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get messages for a ticket
   */
  getTicketMessages(ticketId: number): Observable<SupportMessage[]> {
    return this.http.get<SupportMessage[]>(`${this.apiUrl}/tickets/${ticketId}/messages`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Send a message in a ticket (simplified signature)
   */
  sendMessage(ticketId: number, message: string, userId: number): Observable<SupportMessage> {
    const params = new HttpParams().set('userId', userId.toString());
    const request: SendMessageRequest = { message };
    return this.http.post<SupportMessage>(`${this.apiUrl}/tickets/${ticketId}/messages`, request, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Update ticket status
   */
  updateTicketStatus(ticketId: number, status: TicketStatus): Observable<AdminResponse> {
    const request: UpdateTicketStatusRequest = { status };
    return this.http.put<AdminResponse>(`${this.apiUrl}/tickets/${ticketId}/status`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update ticket priority
   */
  updateTicketPriority(ticketId: number, priority: TicketPriority): Observable<AdminResponse> {
    return this.http.put<AdminResponse>(`${this.apiUrl}/tickets/${ticketId}/priority`, { priority })
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
      errorMessage = error.error.message;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
