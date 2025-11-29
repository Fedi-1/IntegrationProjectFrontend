import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  // Base API URL - automatically switches between local and production
  public readonly API_URL = environment.apiUrl;

  // Convenience methods to build URLs
  getUrl(endpoint: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.API_URL}/${cleanEndpoint}`;
  }

  // Auth endpoints
  get AUTH_URL() { return `${this.API_URL}/api/auth`; }
  
  // Quiz endpoints
  get QUIZ_URL() { return `${this.API_URL}/api/quiz`; }
  
  // Schedule endpoints
  get SCHEDULE_URL() { return `${this.API_URL}/daily-schedule`; }
  
  // Parent endpoints
  get PARENT_URL() { return `${this.API_URL}/parent`; }
}
