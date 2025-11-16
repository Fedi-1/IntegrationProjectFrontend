import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserDTO } from '../../../models/auth.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-parent-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './parent-navbar.component.html',
  styleUrls: ['./parent-navbar.component.css']
})
export class ParentNavbarComponent implements OnInit {
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
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
    // Load any saved preferences
  }

  // Navigation methods
  goToDashboard() {
    this.router.navigate(['/parent-dashboard']);
  }

  // Settings methods
  openSettings() {
    this.showSettings = true;
  }

  closeSettings() {
    this.showSettings = false;
    this.showChangePassword = false;
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  openChangePassword() {
    this.showChangePassword = true;
    this.changePasswordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  closeChangePassword() {
    this.showChangePassword = false;
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  changePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.changePasswordForm.currentPassword || !this.changePasswordForm.newPassword) {
      this.passwordError = 'Please fill in all fields';
      return;
    }

    if (this.changePasswordForm.newPassword !== this.changePasswordForm.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      return;
    }

    if (this.changePasswordForm.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters';
      return;
    }

    const request = {
      cin: this.currentUser?.cin,
      currentPassword: this.changePasswordForm.currentPassword,
      newPassword: this.changePasswordForm.newPassword
    };

    this.http.post<any>('https://integrationprojectbackend.onrender.com/api/auth/change-password', request)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.passwordSuccess = 'Password changed successfully!';
            setTimeout(() => {
              this.closeChangePassword();
            }, 2000);
          } else {
            this.passwordError = response.message || 'Failed to change password';
          }
        },
        error: (err) => {
          console.error('Error changing password:', err);
          this.passwordError = err.error?.message || 'Failed to change password';
        }
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
