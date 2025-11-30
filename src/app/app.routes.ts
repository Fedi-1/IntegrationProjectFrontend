import { Routes } from '@angular/router';
import { AccueilComponent } from './components/accueil/accueil.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { ParentDashboardComponent } from './components/parent-dashboard/parent-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ScheduleGeneratorComponent } from './components/schedule-generator/schedule-generator.component';
import { ScheduleViewComponent } from './components/schedule-view/schedule-view.component';
import { QuizComponent } from './quiz/quiz.component';
import { QuizHistoryComponent } from './quiz-history/quiz-history.component';
import { TodayScheduleComponent } from './components/today-schedule/today-schedule.component';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component';
import { SupportComponent } from './components/support/support.component';
import { AdminSupportComponent } from './components/admin-support/admin-support.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { authGuard, studentGuard, parentGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'accueil', component: AccueilComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { 
    path: 'dashboard', 
    component: StudentDashboardComponent,
    canActivate: [studentGuard]  // Only students can access
  },
  { 
    path: 'parent-dashboard', 
    component: ParentDashboardComponent,
    canActivate: [parentGuard]  // Only parents can access
  },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent,
    canActivate: [adminGuard]  // Only administrators can access
  },
  { 
    path: 'generate', 
    component: ScheduleGeneratorComponent,
    canActivate: [studentGuard]  // Only students can generate schedules
  },
  { 
    path: 'schedule-view', 
    component: ScheduleViewComponent,
    canActivate: [studentGuard]  // Only students can view schedules
  },
  { 
    path: 'quiz', 
    component: QuizComponent,
    canActivate: [studentGuard]  // Only students can take quizzes
  },
  { 
    path: 'quiz-history', 
    component: QuizHistoryComponent,
    canActivate: [studentGuard]  // Only students can view quiz history
  },
  { 
    path: 'today-schedule', 
    component: TodayScheduleComponent,
    canActivate: [studentGuard]  // Only students have daily schedules
  },
  { 
    path: 'notification-settings', 
    component: NotificationSettingsComponent,
    canActivate: [authGuard]  // All authenticated users can configure notifications
  },
  { 
    path: 'support', 
    component: SupportComponent,
    canActivate: [authGuard]  // All authenticated users can create support tickets
  },
  { 
    path: 'admin-support', 
    component: AdminSupportComponent,
    canActivate: [adminGuard]  // Only administrators can manage support tickets
  },
  { path: '**', redirectTo: '/login' }
];
