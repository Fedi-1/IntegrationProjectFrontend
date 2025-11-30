import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  validatingToken: boolean = true;
  tokenValid: boolean = false;
  success: boolean = false;
  error: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (this.token) {
        this.validateToken();
      } else {
        this.validatingToken = false;
        this.error = 'Token manquant. Le lien est invalide.';
      }
    });
  }

  validateToken(): void {
    this.validatingToken = true;
    this.authService.validateResetToken(this.token).subscribe({
      next: (response: any) => {
        this.validatingToken = false;
        this.tokenValid = response.valid;
        if (!response.valid) {
          this.error = response.message || 'Le lien est invalide ou expiré';
        }
      },
      error: (err: any) => {
        this.validatingToken = false;
        this.tokenValid = false;
        this.error = 'Erreur lors de la validation du token';
      }
    });
  }

  onSubmit(): void {
    this.error = '';

    if (!this.newPassword || this.newPassword.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.loading = true;

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = true;
        this.error = '';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Erreur lors de la réinitialisation du mot de passe';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
