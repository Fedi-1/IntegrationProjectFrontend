import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ScheduleService } from '../../services/schedule.service';
import { AuthService } from '../../services/auth.service';
import { UserDTO } from '../../models/auth.model';
import { StudentNavbarComponent } from '../shared/student-navbar/student-navbar.component';

interface TodayScheduleItem {
  id: number;
  timeSlot: string;
  activity: string;
  durationMinutes: number;
  topic: string;
  subjectName?: string;
  completed: boolean;
  completedAt?: string;
  isLate?: boolean;
}

interface TodayScheduleResponse {
  success: boolean;
  day: string;
  date: string;
  schedules: TodayScheduleItem[];
  stats: {
    total: number;
    completed: number;
    remaining: number;
    late: number;
    completionPercentage: number;
  };
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentNavbarComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  hasSchedule = false;
  loading = true;
  currentUser: UserDTO | null = null;
  
  // Today's schedule
  todaySchedule: TodayScheduleItem[] = [];
  todayStats: any = null;
  currentDay: string = '';
  loadingToday: boolean = false;

  constructor(
    private router: Router,
    private scheduleService: ScheduleService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Get current user from auth service
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.cin) {
        this.checkForExistingSchedule(user.cin);
        this.loadTodaySchedule(user.cin);
      }
    });
  }

  checkForExistingSchedule(cin: string) {
    this.scheduleService.getStudentSchedule(cin).subscribe({
      next: (schedule) => {
        this.hasSchedule = schedule && Object.keys(schedule).length > 0;
        this.loading = false;
      },
      error: () => {
        this.hasSchedule = false;
        this.loading = false;
      }
    });
  }

  loadTodaySchedule(cin: string) {
    this.loadingToday = true;
    this.http.get<TodayScheduleResponse>(`http://localhost:5069/api/daily-schedule/today/${cin}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.todaySchedule = response.schedules;
            this.todayStats = response.stats;
            this.currentDay = response.day;
          }
          this.loadingToday = false;
        },
        error: (err) => {
          console.error('Error loading today schedule:', err);
          this.loadingToday = false;
        }
      });
  }

  markAsCompleted(scheduleId: number) {
    this.http.post(`http://localhost:5069/api/daily-schedule/complete/${scheduleId}`, {})
      .subscribe({
        next: () => {
          // Update local state
          const item = this.todaySchedule.find(s => s.id === scheduleId);
          if (item) {
            item.completed = true;
            // Recalculate stats
            if (this.currentUser && this.currentUser.cin) {
              this.loadTodaySchedule(this.currentUser.cin);
            }
          }
        },
        error: (err) => {
          console.error('Error marking as completed:', err);
        }
      });
  }

  markAsUncompleted(scheduleId: number) {
    this.http.post(`http://localhost:5069/api/daily-schedule/uncomplete/${scheduleId}`, {})
      .subscribe({
        next: () => {
          // Update local state
          const item = this.todaySchedule.find(s => s.id === scheduleId);
          if (item) {
            item.completed = false;
            // Recalculate stats
            if (this.currentUser && this.currentUser.cin) {
              this.loadTodaySchedule(this.currentUser.cin);
            }
          }
        },
        error: (err) => {
          console.error('Error marking as uncompleted:', err);
        }
      });
  }

  navigateToGenerate() {
    this.router.navigate(['/generate']);
  }

  navigateToView() {
    this.router.navigate(['/schedule-view']);
  }

  navigateToQuiz() {
    this.router.navigate(['/quiz']);
  }

  // Navigate to quiz history page
  navigateToHistory() {
    this.router.navigate(['/quiz-history']);
  }

  // Navigate to today's study plan page
  navigateToToday() {
    this.router.navigate(['/today-schedule']);
  }
}
