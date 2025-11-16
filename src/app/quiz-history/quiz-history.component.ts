import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StudentNavbarComponent } from '../components/shared/student-navbar/student-navbar.component';

interface QuizHistoryItem {
  id: number;
  subject: string;
  topic: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  generatedAt: string;
}

@Component({
  selector: 'app-quiz-history',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentNavbarComponent],
  templateUrl: './quiz-history.component.html',
  styleUrls: ['./quiz-history.component.css']
})
export class QuizHistoryComponent implements OnInit {
  quizzes: QuizHistoryItem[] = [];
  loading: boolean = true;
  error: string = '';
  studentCin: string = '';

  // Filter options
  selectedSubject: string = 'all';
  availableSubjects: string[] = [];

  // Sorting
  sortBy: 'date' | 'score' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.studentCin = currentUser?.cin || '';
    
    if (!this.studentCin) {
      this.error = 'Student CIN not found. Please login again.';
      this.loading = false;
    } else {
      this.loadQuizHistory();
    }
  }

  loadQuizHistory(): void {
    this.loading = true;
    this.error = '';

    this.http.get<any>(`https://integrationprojectbackend.onrender.com/api/quiz/history/${this.studentCin}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.quizzes = response.quizzes;
            this.extractSubjects();
            this.sortQuizzes();
          } else {
            this.error = 'Failed to load quiz history';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading quiz history:', err);
          this.error = 'Error loading quiz history. Please try again.';
          this.loading = false;
        }
      });
  }

  extractSubjects(): void {
    const subjects = new Set(this.quizzes.map(q => q.subject));
    this.availableSubjects = Array.from(subjects).sort();
  }

  get filteredQuizzes(): QuizHistoryItem[] {
    let filtered = this.quizzes;

    // Filter by subject
    if (this.selectedSubject !== 'all') {
      filtered = filtered.filter(q => q.subject === this.selectedSubject);
    }

    return filtered;
  }

  sortQuizzes(): void {
    this.quizzes.sort((a, b) => {
      let comparison = 0;

      if (this.sortBy === 'date') {
        const dateA = new Date(a.completedAt).getTime();
        const dateB = new Date(b.completedAt).getTime();
        comparison = dateA - dateB;
      } else if (this.sortBy === 'score') {
        comparison = a.score - b.score;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  onSortChange(sortBy: 'date' | 'score'): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'desc';
    }
    this.sortQuizzes();
  }

  viewQuizDetails(quizId: number): void {
    this.router.navigate(['/quiz'], { 
      queryParams: { viewResult: quizId } 
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }

  getScoreEmoji(score: number): string {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    if (score >= 40) return '📚';
    return '💪';
  }

  calculateAverageScore(): number {
    if (this.filteredQuizzes.length === 0) return 0;
    const total = this.filteredQuizzes.reduce((sum, q) => sum + q.score, 0);
    return Math.round(total / this.filteredQuizzes.length);
  }

  goBack(): void {
    this.router.navigate(['/student-dashboard']);
  }

  goToQuiz(): void {
    this.router.navigate(['/quiz']);
  }
}
