import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

interface NotificationConfig {
  revisionReminder: boolean; // Check for revision ending soon
  homeworkAlert: boolean; // Check for unfinished homework
  quizAlert: boolean; // Check for quiz scores
}

interface ScheduleTask {
  id: number;
  timeSlot: string;
  activity: string;
  subject?: string;
  topic?: string;
  completed: boolean;
  day: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;
  private notificationSubscription?: Subscription;
  private notificationConfig: NotificationConfig = {
    revisionReminder: true,
    homeworkAlert: true,
    quizAlert: true
  };

  // Notification state
  private unreadNotifications = new BehaviorSubject<number>(0);
  public unreadNotifications$ = this.unreadNotifications.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('notificationConfig');
    if (savedConfig) {
      this.notificationConfig = JSON.parse(savedConfig);
    }
  }

  /**
   * Start monitoring for notifications
   * Call this after user logs in
   */
  startMonitoring() {
    if (this.notificationSubscription) {
      return; // Already monitoring
    }

    console.log('📱 Starting notification monitoring...');

    // Check every 5 minutes
    this.notificationSubscription = interval(5 * 60 * 1000).subscribe(() => {
      this.checkAllNotifications();
    });

    // Check immediately on start
    this.checkAllNotifications();
  }

  /**
   * Stop monitoring (call on logout)
   */
  stopMonitoring() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
      this.notificationSubscription = undefined;
      console.log('📱 Notification monitoring stopped');
    }
  }

  /**
   * Check all notification types
   */
  private checkAllNotifications() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    console.log('🔔 Checking for notifications...');

    if (this.notificationConfig.revisionReminder) {
      this.checkRevisionReminders(currentUser.cin);
    }

    if (this.notificationConfig.homeworkAlert) {
      this.checkUnfinishedHomework(currentUser.cin);
    }

    if (this.notificationConfig.quizAlert) {
      this.checkQuizAlerts(currentUser.cin);
    }
  }

  /**
   * Check for revision sessions ending soon
   */
  private checkRevisionReminders(studentCin: string) {
    this.http.get<any[]>(`${this.apiUrl}/api/schedule/student/${studentCin}/today-tasks`)
      .subscribe({
        next: (tasks) => {
          const now = new Date();
          const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

          for (const task of tasks) {
            if (task.completed) continue;

            // Check if it's a revision/study task
            const activity = (task.activity || '').toLowerCase();
            if (!activity.includes('revision') && !activity.includes('study')) {
              continue;
            }

            // Parse end time
            if (task.timeSlot && task.timeSlot.includes('-')) {
              const endTime = task.timeSlot.split('-')[1].trim();
              const [hours, minutes] = endTime.split(':').map(Number);
              
              const sessionEnd = new Date();
              sessionEnd.setHours(hours, minutes, 0, 0);

              const minutesUntilEnd = Math.floor((sessionEnd.getTime() - now.getTime()) / 60000);

              // Alert if ending in 5-15 minutes
              if (minutesUntilEnd > 5 && minutesUntilEnd <= 15) {
                const subject = task.subject || 'your subject';
                const topic = task.topic ? ` on ${task.topic}` : '';
                
                this.showNotification(
                  'Revision Ending Soon ⏰',
                  `Your ${subject}${topic} session ends in ${minutesUntilEnd} minutes!`
                );
                
                // Send email notification via backend
                this.sendRevisionReminderEmail(studentCin, task, minutesUntilEnd);
              }
            }
          }
        },
        error: (err) => console.error('Error checking revision reminders:', err)
      });
  }

  /**
   * Check for unfinished homework (run at 23:00)
   */
  private checkUnfinishedHomework(studentCin: string) {
    const now = new Date();
    const hour = now.getHours();

    // Only check at 23:00 hour
    if (hour !== 23) return;

    this.http.get<any[]>(`${this.apiUrl}/api/schedule/student/${studentCin}/today-tasks`)
      .subscribe({
        next: (tasks) => {
          const unfinishedTasks = tasks.filter(t => !t.completed);
          
          if (unfinishedTasks.length > 0) {
            this.showNotification(
              'Unfinished Tasks ⚠️',
              `You have ${unfinishedTasks.length} incomplete task(s) today`
            );

            // Send email notification
            this.sendHomeworkAlertEmail(studentCin, unfinishedTasks);
          }
        },
        error: (err) => console.error('Error checking homework:', err)
      });
  }

  /**
   * Check for recent quiz scores
   */
  private checkQuizAlerts(studentCin: string) {
    this.http.get<any[]>(`${this.apiUrl}/api/quiz/student/${studentCin}/recent`)
      .subscribe({
        next: (quizzes) => {
          for (const quiz of quizzes) {
            if (quiz.status === 'completed' && quiz.score !== null) {
              const emoji = quiz.score >= 70 ? '✅' : '⚠️';
              
              this.showNotification(
                `Quiz Completed ${emoji}`,
                `${quiz.subject} - ${quiz.topic}: ${quiz.score}%`
              );

              // Send email notification
              this.sendQuizAlertEmail(studentCin, quiz);
            }
          }
        },
        error: (err) => console.error('Error checking quiz alerts:', err)
      });
  }

  /**
   * Send revision reminder email through backend
   */
  private sendRevisionReminderEmail(studentCin: string, task: any, minutesLeft: number) {
    this.http.post(`${this.apiUrl}/api/notifications/revision-reminder`, {
      studentCin,
      subject: task.subject,
      topic: task.topic,
      minutesLeft
    }).subscribe({
      next: () => console.log('✉️ Revision reminder email sent'),
      error: (err) => console.error('Failed to send email:', err)
    });
  }

  /**
   * Send homework alert email through backend
   */
  private sendHomeworkAlertEmail(studentCin: string, tasks: any[]) {
    this.http.post(`${this.apiUrl}/api/notifications/homework-alert`, {
      studentCin,
      unfinishedCount: tasks.length,
      tasks
    }).subscribe({
      next: () => console.log('✉️ Homework alert email sent'),
      error: (err) => console.error('Failed to send email:', err)
    });
  }

  /**
   * Send quiz alert email through backend
   */
  private sendQuizAlertEmail(studentCin: string, quiz: any) {
    this.http.post(`${this.apiUrl}/api/notifications/quiz-alert`, {
      studentCin,
      quizTitle: `${quiz.subject} - ${quiz.topic}`,
      score: quiz.score
    }).subscribe({
      next: () => console.log('✉️ Quiz alert email sent'),
      error: (err) => console.error('Failed to send email:', err)
    });
  }

  /**
   * Show browser notification
   */
  private showNotification(title: string, body: string) {
    // Request permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }

    // Also show in-app notification
    this.incrementUnreadNotifications();
    console.log(`🔔 ${title}: ${body}`);
  }

  /**
   * Increment unread notification counter
   */
  private incrementUnreadNotifications() {
    this.unreadNotifications.next(this.unreadNotifications.value + 1);
  }

  /**
   * Clear unread notifications
   */
  clearNotifications() {
    this.unreadNotifications.next(0);
  }

  /**
   * Update notification config
   */
  updateConfig(config: Partial<NotificationConfig>) {
    this.notificationConfig = { ...this.notificationConfig, ...config };
    localStorage.setItem('notificationConfig', JSON.stringify(this.notificationConfig));
  }

  /**
   * Get current config
   */
  getConfig(): NotificationConfig {
    return { ...this.notificationConfig };
  }

  /**
   * Request browser notification permission
   */
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}
