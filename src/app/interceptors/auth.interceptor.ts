import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip adding CIN for public endpoints
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/signup') || 
      req.url.includes('/password/') ||
      req.url.includes('/api/health')) {
    console.log('🔓 Public endpoint, skipping CIN:', req.url);
    return next(req);
  }

  // Get CIN from localStorage
  const cin = localStorage.getItem('userCIN');

  // Debug logging
  console.log('🔐 Interceptor running for:', req.url);
  console.log('📝 CIN from localStorage:', cin);

  // Add CIN header to all other requests
  if (cin) {
    const clonedRequest = req.clone({
      setHeaders: {
        'X-User-CIN': cin
      }
    });
    console.log('✅ Added X-User-CIN header:', cin);
    return next(clonedRequest);
  }

  console.log('⚠️ No CIN found in localStorage!');
  return next(req);
};
