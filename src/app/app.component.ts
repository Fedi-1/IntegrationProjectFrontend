import { Component, OnInit, OnDestroy } from '@angular/core';  
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';  
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { UserDTO } from './models/auth.model';
  
@Component({  
  selector: 'app-root',  
  standalone: true,  
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],  
  templateUrl: './app.component.html',  
  styleUrl: './app.component.css'  
})  
export class AppComponent implements OnInit, OnDestroy {  
  title = 'Student Schedule Generator';
  currentUser: UserDTO | null = null;
  unreadNotifications = 0;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // TODO: Enable notifications when backend endpoints are ready
      // Start/stop notifications based on login state
      // if (user) {
      //   // Request notification permission on login
      //   this.notificationService.requestPermission().then(granted => {
      //     if (granted) {
      //       console.log('✅ Browser notifications enabled');
      //     }
      //   });
      //   
      //   // Start monitoring for notifications
      //   this.notificationService.startMonitoring();
      // } else {
      //   // Stop monitoring on logout
      //   this.notificationService.stopMonitoring();
      // }
    });

    // Subscribe to unread notification count
    this.notificationService.unreadNotifications$.subscribe(count => {
      this.unreadNotifications = count;
    });
  }

  ngOnDestroy(): void {
    // Clean up notification monitoring
    this.notificationService.stopMonitoring();
  }

  logout(): void {
    this.notificationService.stopMonitoring();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 
