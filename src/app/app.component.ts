import { Component, OnInit } from '@angular/core';  
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';  
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { UserDTO } from './models/auth.model';
  
@Component({  
  selector: 'app-root',  
  standalone: true,  
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],  
  templateUrl: './app.component.html',  
  styleUrl: './app.component.css'  
})  
export class AppComponent implements OnInit {  
  title = 'Student Schedule Generator';
  currentUser: UserDTO | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 
