import { Routes } from '@angular/router';
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
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'dashboard', 
    component: StudentDashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'parent-dashboard', 
    component: ParentDashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent,
    canActivate: [authGuard]
    // Note: Admins can't signup through public form, but can login if created in DB
  },
  { 
    path: 'generate', 
    component: ScheduleGeneratorComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'schedule-view', 
    component: ScheduleViewComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'quiz', 
    component: QuizComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'quiz-history', 
    component: QuizHistoryComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'today-schedule', 
    component: TodayScheduleComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'notification-settings', 
    component: NotificationSettingsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'support', 
    component: SupportComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'admin-support', 
    component: AdminSupportComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
