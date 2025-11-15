import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { UserDTO } from '../../models/auth.model';
import { ParentNavbarComponent } from '../shared/parent-navbar/parent-navbar.component';

interface Child {
  id: number;
  cin: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phoneNumber: string;
}

interface ScheduleItem {
  id: number;
  timeSlot: string;
  activity: string;
  durationMinutes: number;
  completed: boolean;
  completedAt?: string;
  subjectName?: string;
}

interface Alert {
  type: string;
  title: string;
  message: string;
  timestamp: string;
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ParentNavbarComponent],
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.css']
})
export class ParentDashboardComponent implements OnInit {
  currentUser: UserDTO | null = null;
  children: Child[] = [];
  selectedChild: Child | null = null;
  loading = true;
  
  // Child data
  childSchedule: any = null;
  childTodaySchedule: any = null;
  childPerformance: any = null;
  childAlerts: Alert[] = [];
  
  // View state
  activeView: 'schedule' | 'today' | 'performance' | 'alerts' = 'today';

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.cin) {
        this.loadChildren(user.cin);
      }
    });
  }

  loadChildren(parentCin: string) {
    this.loading = true;
    this.http.get<any>(`http://localhost:5069/api/parent/${parentCin}/children`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.children = response.children;
            if (this.children.length > 0) {
              this.selectChild(this.children[0]);
            }
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading children:', err);
          this.loading = false;
        }
      });
  }

  selectChild(child: Child) {
    this.selectedChild = child;
    this.loadChildData(child.cin);
  }

  loadChildData(childCin: string) {
    // Load today's schedule
    this.http.get<any>(`http://localhost:5069/api/parent/child/${childCin}/today`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.childTodaySchedule = response;
          }
        },
        error: (err) => console.error('Error loading today schedule:', err)
      });

    // Load full week schedule
    this.http.get<any>(`http://localhost:5069/api/parent/child/${childCin}/schedule`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.childSchedule = response;
          }
        },
        error: (err) => console.error('Error loading schedule:', err)
      });

    // Load performance data
    this.http.get<any>(`http://localhost:5069/api/parent/child/${childCin}/performance`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.childPerformance = response;
          }
        },
        error: (err) => console.error('Error loading performance:', err)
      });

    // Load alerts
    this.http.get<any>(`http://localhost:5069/api/parent/child/${childCin}/alerts`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.childAlerts = response.alerts;
          }
        },
        error: (err) => console.error('Error loading alerts:', err)
      });
  }

  setActiveView(view: 'schedule' | 'today' | 'performance' | 'alerts') {
    this.activeView = view;
  }

  getAlertClass(type: string): string {
    return `alert-${type}`;
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}
  