import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ScheduleGenerationRequest,
  ScheduleGenerationResponse,
  WeekSchedule
} from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = 'https://integrationprojectbackend.onrender.com/api/schedule';

  constructor(private http: HttpClient) {}

  /**
   * Check API health and ML service status
   */
  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generate schedule from PDF timetable
   */
  generateScheduleFromPdf(
    studentCin: string,
    pdfFile: File,
    maxStudyDuration?: number
  ): Observable<ScheduleGenerationResponse> {
    const formData = new FormData();
    formData.append('file', pdfFile);
    if (maxStudyDuration) {
      formData.append('maxStudyDuration', maxStudyDuration.toString());
    }

    return this.http
      .post<ScheduleGenerationResponse>(
        `${this.apiUrl}/generate-from-pdf/${studentCin}`,
        formData
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Get saved schedule for a student
   */
  getStudentSchedule(studentCin: string): Observable<WeekSchedule> {
    return this.http
      .get<WeekSchedule>(`${this.apiUrl}/student/${studentCin}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete student's schedule
   */
  deleteStudentSchedule(studentCin: string): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/student/${studentCin}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Error handler
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      // Try to get the actual message from the backend response first
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.status === 404) {
        errorMessage = 'Student not found or no schedule available';
      } else if (error.status === 501) {
        errorMessage = 'Feature not yet implemented. Please use manual schedule generation.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please check the backend logs for details.';
      } else {
        errorMessage = `Server returned code ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get array of days in order
   */
  getDaysOfWeek(): string[] {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  }

  /**
   * Get activity color class
   */
  getActivityColor(activity: string): string {
    const colors: { [key: string]: string } = {
      'reading': 'activity-reading',
      'exercises': 'activity-exercises',
      'flashcards': 'activity-flashcards',
      'mock_test': 'activity-test',
      'break': 'activity-break'
    };
    return colors[activity] || 'activity-default';
  }

  /**
   * Get activity icon
   */
  getActivityIcon(activity: string): string {
    const icons: { [key: string]: string } = {
      'reading': '📖',
      'exercises': '✏️',
      'flashcards': '🎴',
      'mock_test': '📝',
      'break': '☕'
    };
    return icons[activity] || '📚';
  }
}
