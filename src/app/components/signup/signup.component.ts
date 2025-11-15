import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SignupRequest } from '../../models/auth.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;

  roles = [
    { value: 'ETUDIANT', label: 'Student' },
    { value: 'PARENT', label: 'Parent' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      cin: ['', [Validators.required, Validators.minLength(5)]],
      phoneNumber: ['', [Validators.required]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(150)]],
      role: ['ETUDIANT', [Validators.required]],
      parentCin: [''],
      maxStudyDuration: [90]
    });

    // Watch role changes to handle conditional validation
    this.signupForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'ETUDIANT') {
        this.signupForm.get('parentCin')?.setValidators([Validators.required]);
        this.signupForm.get('maxStudyDuration')?.setValidators([Validators.required, Validators.min(30)]);
      } else {
        this.signupForm.get('parentCin')?.clearValidators();
        this.signupForm.get('maxStudyDuration')?.clearValidators();
      }
      this.signupForm.get('parentCin')?.updateValueAndValidity();
      this.signupForm.get('maxStudyDuration')?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.loading = true;
      this.error = null;

      const formValue = this.signupForm.value;
      
      // Create request object
      const request: SignupRequest = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        password: formValue.password,
        cin: formValue.cin,
        phoneNumber: formValue.phoneNumber,
        age: formValue.age,
        role: formValue.role
      };

      // Only include student-specific fields if role is ETUDIANT
      if (formValue.role === 'ETUDIANT') {
        request.parentCin = formValue.parentCin;
        request.maxStudyDuration = formValue.maxStudyDuration;
      }

      console.log('Signup request:', request); // Debug log

      this.authService.signup(request).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Signup response:', response); // Debug log
          if (response.success) {
            // Redirect based on role
            if (response.user?.role === 'ETUDIANT') {
              this.router.navigate(['/dashboard']);
            } else if (response.user?.role === 'PARENT') {
              this.router.navigate(['/parent-dashboard']);
            } else {
              // Default fallback (shouldn't happen for public signup)
              this.router.navigate(['/dashboard']);
            }
          } else {
            this.error = response.message;
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Signup error:', error); // Debug log
          this.error = error.message || 'Signup failed. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched(this.signupForm);
      console.log('Form validation errors:', this.getFormValidationErrors()); // Debug log
    }
  }

  private getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.signupForm.controls).forEach(key => {
      const controlErrors = this.signupForm.get(key)?.errors;
      if (controlErrors) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isStudent(): boolean {
    return this.signupForm.get('role')?.value === 'ETUDIANT';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get cin() { return this.signupForm.get('cin'); }
  get phoneNumber() { return this.signupForm.get('phoneNumber'); }
  get age() { return this.signupForm.get('age'); }
  get role() { return this.signupForm.get('role'); }
  get parentCin() { return this.signupForm.get('parentCin'); }
  get maxStudyDuration() { return this.signupForm.get('maxStudyDuration'); }
}
