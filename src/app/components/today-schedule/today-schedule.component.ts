import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { UserDTO } from '../../models/auth.model';

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
  selector: 'app-today-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './today-schedule.component.html',
  styleUrl: './today-schedule.component.css'
})
export class TodayScheduleComponent implements OnInit {
  todaySchedule: TodayScheduleItem[] = [];
  todayStats: any = null;
  currentDay: string = '';
  currentDate: string = '';
  loadingToday: boolean = true;
  currentUser: UserDTO | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser && this.currentUser.cin) {
      this.loadTodaySchedule(this.currentUser.cin);
    }
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
            this.currentDate = response.date;
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
          const item = this.todaySchedule.find(s => s.id === scheduleId);
          if (item) {
            item.completed = true;
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
          const item = this.todaySchedule.find(s => s.id === scheduleId);
          if (item) {
            item.completed = false;
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

  goBack() {
    this.router.navigate(['/student-dashboard']);
  }
}
