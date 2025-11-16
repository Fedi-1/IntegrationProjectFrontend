import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserDTO } from '../../../models/auth.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-student-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-navbar.component.html',
  styleUrls: ['./student-navbar.component.css']
})
export class StudentNavbarComponent implements OnInit {
  currentUser: UserDTO | null = null;
  showSettings: boolean = false;
  showChangePassword: boolean = false;
  
  // Change password form
  changePasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordError: string = '';
  passwordSuccess: string = '';
  
  // Preferences
  preferences = {
    notifications: true,
    emailReminders: true,
    darkMode: false
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      this.preferences = JSON.parse(savedPreferences);
    }
  }

  ngOnInit() {
    // Get current user from auth service
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  // Navigation methods
  goToDashboard() {
    this.router.navigate(['/student']);
  }

  goToGenerate() {
    this.router.navigate(['/generate']);
  }

  goToViewSchedule() {
    this.router.navigate(['/schedule-view']);
  }

  goToToday() {
    this.router.navigate(['/today-schedule']);
  }

  goToQuiz() {
    this.router.navigate(['/quiz']);
  }

  goToHistory() {
    this.router.navigate(['/quiz-history']);
  }

  // Settings modal methods
  openSettings() {
    this.showSettings = true;
    this.showChangePassword = false;
    this.passwordError = '';
    this.passwordSuccess = '';
    document.body.style.overflow = 'hidden';
  }

  closeSettings() {
    this.showSettings = false;
    this.showChangePassword = false;
    this.passwordError = '';
    this.passwordSuccess = '';
    document.body.style.overflow = 'auto';
  }

  openChangePassword() {
    this.showChangePassword = true;
    this.passwordError = '';
    this.passwordSuccess = '';
    // Reset form
    this.changePasswordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  closeChangePassword() {
    this.showChangePassword = false;
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  // Change password method (matches parent navbar style)
  changePassword() {
    this.submitChangePassword();
  }

  // Change password submission
  submitChangePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';

    // Validation
    if (!this.changePasswordForm.currentPassword || 
        !this.changePasswordForm.newPassword || 
        !this.changePasswordForm.confirmPassword) {
      this.passwordError = 'All fields are required';
      return;
    }

    if (this.changePasswordForm.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters';
      return;
    }

    if (this.changePasswordForm.newPassword !== this.changePasswordForm.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      return;
    }

    if (!this.currentUser || !this.currentUser.cin) {
      this.passwordError = 'User information not available';
      return;
    }

    // Call backend API to change password
    const changePasswordRequest = {
      cin: this.currentUser.cin,
      currentPassword: this.changePasswordForm.currentPassword,
      newPassword: this.changePasswordForm.newPassword
    };

    this.http.post('https://integrationprojectbackend.onrender.com/api/auth/change-password', changePasswordRequest)
      .subscribe({
        next: () => {
          this.passwordSuccess = 'Password changed successfully!';
          // Reset form
          this.changePasswordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          // Close modal after 2 seconds
          setTimeout(() => {
            this.closeChangePassword();
          }, 2000);
        },
        error: (err) => {
          if (err.status === 401) {
            this.passwordError = 'Current password is incorrect';
          } else if (err.error && err.error.message) {
            this.passwordError = err.error.message;
          } else {
            this.passwordError = 'Failed to change password. Please try again.';
          }
        }
      });
  }

  savePreferences() {
    localStorage.setItem('userPreferences', JSON.stringify(this.preferences));
    console.log('Preferences saved:', this.preferences);
  }

  toggleDarkMode() {
    this.savePreferences();
    // Dark mode functionality can be implemented later
    alert('Dark mode coming soon! 🌙');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
