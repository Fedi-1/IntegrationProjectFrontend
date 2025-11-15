import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ScheduleService } from '../../services/schedule.service';
import { AuthService } from '../../services/auth.service';
import { UserDTO } from '../../models/auth.model';
import { StudentNavbarComponent } from '../shared/student-navbar/student-navbar.component';

@Component({
  selector: 'app-schedule-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StudentNavbarComponent],
  templateUrl: './schedule-generator.component.html',
  styleUrl: './schedule-generator.component.css'
})
export class ScheduleGeneratorComponent implements OnInit {
  scheduleForm!: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  currentUser: UserDTO | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get current user from auth service
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.initForm();
    });
  }

  initForm() {
    this.scheduleForm = this.fb.group({});
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.error = null;
    } else {
      this.error = 'Please select a valid PDF file';
      this.selectedFile = null;
    }
  }

  removeFile(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.selectedFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  onSubmit() {
    if (this.selectedFile && this.currentUser) {
      this.loading = true;
      this.error = null;
      this.success = null;

      this.scheduleService.generateScheduleFromPdf(
        this.currentUser.cin,
        this.selectedFile,
        this.currentUser.maxStudyDuration
      ).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = 'Schedule generated successfully from your timetable! Redirecting...';
            setTimeout(() => {
              this.router.navigate(['/schedule-view']);
            }, 2000);
          } else {
            this.error = response.message || 'Failed to generate schedule';
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message || 'An error occurred while generating the schedule';
          console.error('Error:', error);
        }
      });
    } else {
      this.error = 'Please upload a PDF file';
    }
  }

  resetForm() {
    this.selectedFile = null;
    this.error = null;
    this.success = null;
  }
}
