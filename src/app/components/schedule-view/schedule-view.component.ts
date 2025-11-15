import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScheduleService } from '../../services/schedule.service';
import { AuthService } from '../../services/auth.service';
import { WeekSchedule, DaySchedule, ActivityBlock } from '../../models/schedule.model';
import { UserDTO } from '../../models/auth.model';
import { StudentNavbarComponent } from '../shared/student-navbar/student-navbar.component';

@Component({
  selector: 'app-schedule-view',
  standalone: true,
  imports: [CommonModule, StudentNavbarComponent],
  templateUrl: './schedule-view.component.html',
  styleUrl: './schedule-view.component.css'
})
export class ScheduleViewComponent implements OnInit {
  schedule: WeekSchedule | null = null;
  loading = true;
  error: string | null = null;
  selectedDay: string = 'Monday';
  daysOfWeek: string[] = [];
  currentUser: UserDTO | null = null;

  constructor(
    private scheduleService: ScheduleService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.daysOfWeek = this.scheduleService.getDaysOfWeek();
    
    // Get current user and load their schedule
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.cin) {
        this.loadSchedule(user.cin);
      }
    });
  }

  loadSchedule(cin: string) {
    this.loading = true;
    this.error = null;

    this.scheduleService.getStudentSchedule(cin).subscribe({
      next: (schedule) => {
        // Normalize French day names to English
        this.schedule = this.normalizeDayNames(schedule);
        this.loading = false;
        
        console.log('[ScheduleView] Schedule loaded. Keys:', Object.keys(this.schedule));
        
        // Keep Monday as default selected day
        this.selectedDay = 'Monday';
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Failed to load schedule';
        console.error('Error loading schedule:', error);
      }
    });
  }

  normalizeDayNames(schedule: any): WeekSchedule {
    const mapping: {[key: string]: string} = {
      'Lundi': 'Monday',
      'Mardi': 'Tuesday',
      'Mercredi': 'Wednesday',
      'Jeudi': 'Thursday',
      'Vendredi': 'Friday',
      'Samedi': 'Saturday',
      'Dimanche': 'Sunday'
    };
    
    const normalized: any = {};
    for (const [day, activities] of Object.entries(schedule)) {
      const englishDay = mapping[day] || day; // Use mapping or keep original if already English
      normalized[englishDay] = activities;
      console.log(`[ScheduleView] Mapped ${day} → ${englishDay}`);
    }
    return normalized;
  }

  selectDay(day: string) {
    this.selectedDay = day;
  }

  getDaySchedule(day: string): DaySchedule | null {
    if (!this.schedule) {
      console.log(`[ScheduleView] No schedule loaded yet`);
      return null;
    }
    
    const daySchedule = this.schedule[day];
    console.log(`[ScheduleView] Getting schedule for ${day}:`, daySchedule ? 'Found' : 'Not found');
    
    return daySchedule || null;
  }

  getTimeSlots(daySchedule: DaySchedule): string[] {
    return Object.keys(daySchedule).sort();
  }

  getActivityBlock(daySchedule: DaySchedule, timeSlot: string): ActivityBlock {
    return daySchedule[timeSlot];
  }

  getActivityColor(activity: string): string {
    return this.scheduleService.getActivityColor(activity);
  }

  getActivityIcon(activity: string): string {
    return this.scheduleService.getActivityIcon(activity);
  }

  deleteSchedule() {
    if (!this.currentUser) return;
    
    if (confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      this.loading = true;
      
      this.scheduleService.deleteStudentSchedule(this.currentUser.cin).subscribe({
        next: () => {
          this.loading = false;
          alert('Schedule deleted successfully!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          alert('Failed to delete schedule: ' + error.message);
        }
      });
    }
  }

  regenerateSchedule() {
    this.router.navigate(['/generate']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  printSchedule() {
    window.print();
  }

  exportSchedule() {
    if (this.schedule && this.currentUser) {
      const dataStr = JSON.stringify(this.schedule, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `schedule-${this.currentUser.cin}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  hasScheduleForDay(day: string): boolean {
    return !!(this.schedule && this.schedule[day] && Object.keys(this.schedule[day]).length > 0);
  }

  getTotalStudyHours(day: string): number {
    const daySchedule = this.getDaySchedule(day);
    if (!daySchedule) return 0;

    let totalMinutes = 0;
    Object.values(daySchedule).forEach(block => {
      // Only count study sessions, not breaks
      if (block.activity !== 'break') {
        totalMinutes += block.durationMinutes || 0;
      }
    });

    return Math.round(totalMinutes / 60 * 10) / 10; // Round to 1 decimal
  }
}
