import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <h2>📱 Notification Settings</h2>
      
      <div class="permission-status">
        <div class="status-card" [class.enabled]="browserPermissionGranted" [class.disabled]="!browserPermissionGranted">
          <h3>Browser Notifications</h3>
          <p>{{ browserPermissionStatus }}</p>
          <button *ngIf="!browserPermissionGranted" (click)="requestPermission()" class="btn-primary">
            Enable Browser Notifications
          </button>
        </div>
      </div>

      <div class="notification-types">
        <h3>Email & Browser Alerts</h3>
        
        <div class="notification-option">
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="config.revisionReminder" (change)="saveConfig()">
            <span class="checkbox-text">
              <strong>Revision Ending Reminders</strong>
              <small>Get notified 10 minutes before your revision session ends</small>
            </span>
          </label>
        </div>

        <div class="notification-option">
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="config.homeworkAlert" (change)="saveConfig()">
            <span class="checkbox-text">
              <strong>Homework Completion Alerts</strong>
              <small>Daily reminder at 23:00 for uncompleted tasks</small>
            </span>
          </label>
        </div>

        <div class="notification-option">
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="config.quizAlert" (change)="saveConfig()">
            <span class="checkbox-text">
              <strong>Quiz Score Notifications</strong>
              <small>Get notified when you complete a quiz</small>
            </span>
          </label>
        </div>
      </div>

      <div class="info-box">
        <h4>ℹ️ How It Works</h4>
        <ul>
          <li>Notifications are checked every 5 minutes while you're logged in</li>
          <li>You'll receive both browser notifications and emails</li>
          <li>Parents will also receive email notifications for homework and quiz alerts</li>
          <li>Works even if the backend server is sleeping (no continuous hosting needed)</li>
        </ul>
      </div>

      <div class="unread-counter" *ngIf="unreadCount > 0">
        <span class="badge">{{ unreadCount }}</span> unread notifications
        <button (click)="clearNotifications()" class="btn-secondary">Clear</button>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
    }

    h3 {
      color: #34495e;
      margin-bottom: 1rem;
      font-size: 1.3rem;
    }

    .permission-status {
      margin-bottom: 2rem;
    }

    .status-card {
      padding: 1.5rem;
      border-radius: 8px;
      border: 2px solid #ddd;
    }

    .status-card.enabled {
      background: #d4edda;
      border-color: #28a745;
    }

    .status-card.disabled {
      background: #fff3cd;
      border-color: #ffc107;
    }

    .status-card h3 {
      margin-top: 0;
      margin-bottom: 0.5rem;
    }

    .status-card p {
      margin: 0.5rem 0;
      color: #666;
    }

    .notification-types {
      margin-bottom: 2rem;
    }

    .notification-option {
      padding: 1rem;
      margin-bottom: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      transition: all 0.2s;
    }

    .notification-option:hover {
      background: #e9ecef;
      border-color: #dee2e6;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      cursor: pointer;
      gap: 1rem;
    }

    .checkbox-label input[type="checkbox"] {
      width: 20px;
      height: 20px;
      margin-top: 2px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .checkbox-text {
      flex: 1;
    }

    .checkbox-text strong {
      display: block;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .checkbox-text small {
      display: block;
      color: #6c757d;
      font-size: 0.875rem;
    }

    .info-box {
      background: #e7f3ff;
      border: 1px solid #b3d9ff;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .info-box h4 {
      margin-top: 0;
      color: #0056b3;
    }

    .info-box ul {
      margin: 0.5rem 0 0 1.5rem;
      padding: 0;
      color: #495057;
    }

    .info-box li {
      margin-bottom: 0.5rem;
    }

    .unread-counter {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #fff3cd;
      border-radius: 8px;
      border: 1px solid #ffc107;
    }

    .badge {
      background: #dc3545;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-weight: bold;
    }

    .btn-primary, .btn-secondary {
      padding: 0.5rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }
  `]
})
export class NotificationSettingsComponent implements OnInit {
  config = {
    revisionReminder: true,
    homeworkAlert: true,
    quizAlert: true
  };

  browserPermissionGranted = false;
  browserPermissionStatus = '';
  unreadCount = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Load current config
    this.config = this.notificationService.getConfig();

    // Check browser permission
    this.checkBrowserPermission();

    // Subscribe to unread count
    this.notificationService.unreadNotifications$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  checkBrowserPermission() {
    if ('Notification' in window) {
      this.browserPermissionGranted = Notification.permission === 'granted';
      
      if (Notification.permission === 'granted') {
        this.browserPermissionStatus = '✅ Browser notifications are enabled';
      } else if (Notification.permission === 'denied') {
        this.browserPermissionStatus = '❌ Browser notifications are blocked. Please enable them in your browser settings.';
      } else {
        this.browserPermissionStatus = '⚠️ Browser notifications are not enabled yet. Click the button below to enable.';
      }
    } else {
      this.browserPermissionStatus = '❌ Your browser does not support notifications';
    }
  }

  async requestPermission() {
    const granted = await this.notificationService.requestPermission();
    this.checkBrowserPermission();
    
    if (granted) {
      alert('✅ Browser notifications enabled successfully!');
    } else {
      alert('❌ Please enable notifications in your browser settings.');
    }
  }

  saveConfig() {
    this.notificationService.updateConfig(this.config);
    console.log('✅ Notification settings saved:', this.config);
  }

  clearNotifications() {
    this.notificationService.clearNotifications();
  }
}
