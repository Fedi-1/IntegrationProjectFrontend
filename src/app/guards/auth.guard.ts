import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Basic authentication guard - checks if user is logged in
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Not logged in, redirect to login page
  console.warn('Access denied. Redirecting to login...');
  router.navigate(['/login']);
  return false;
};

/**
 * Student role guard - only allows ETUDIANT role
 */
export const studentGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    console.warn('Not logged in. Redirecting to login...');
    router.navigate(['/login']);
    return false;
  }

  const userRole = localStorage.getItem('userRole');
  if (userRole === 'ETUDIANT') {
    return true;
  }

  console.warn('Access denied. Students only. Redirecting to home...');
  router.navigate(['/accueil']);
  return false;
};

/**
 * Parent role guard - only allows PARENT role
 */
export const parentGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    console.warn('Not logged in. Redirecting to login...');
    router.navigate(['/login']);
    return false;
  }

  const userRole = localStorage.getItem('userRole');
  if (userRole === 'PARENT') {
    return true;
  }

  console.warn('Access denied. Parents only. Redirecting to home...');
  router.navigate(['/accueil']);
  return false;
};

/**
 * Admin role guard - only allows ADMINISTRATOR role
 */
export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    console.warn('Not logged in. Redirecting to login...');
    router.navigate(['/login']);
    return false;
  }

  const userRole = localStorage.getItem('userRole');
  if (userRole === 'ADMINISTRATOR') {
    return true;
  }

  console.warn('Access denied. Administrators only. Redirecting to home...');
  router.navigate(['/accueil']);
  return false;
};
