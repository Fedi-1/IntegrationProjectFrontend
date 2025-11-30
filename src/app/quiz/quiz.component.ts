import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StudentNavbarComponent } from '../components/shared/student-navbar/student-navbar.component';
import { ToastComponent } from '../components/shared/toast/toast.component';

interface QuizQuestion {
  id?: number;
  question: string;
  options: {
    [key: string]: string;  // Allow indexing with any string
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  studentAnswer?: string;
  isCorrect?: boolean;
  explanation?: string;  // Add explanation field
}

interface Quiz {
  quizId: number;
  subject: string;
  topic: string;
  questions: QuizQuestion[];
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentNavbarComponent, ToastComponent],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  studentCin: string = '';
  subject: string = '';
  topic: string = '';
  numQuestions: number = 5;
  availableSubjects: string[] = [];
  loadingSubjects: boolean = false;
  
  quiz: Quiz | null = null;
  currentQuestionIndex: number = 0;
  answers: { [key: number]: string } = {};
  submitted: boolean = false;
  score: number | null = null;
  correctAnswers: number | null = null;
  totalQuestions: number | null = null;
  
  loading: boolean = false;
  error: string = '';

  @ViewChild(ToastComponent) toast!: ToastComponent;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnInit(): void {
    // Get student CIN from auth service
    const currentUser = this.authService.getCurrentUser();
    this.studentCin = currentUser?.cin || '';
    
    if (!this.studentCin) {
      this.error = 'Student CIN not found. Please login again.';
    } else {
      // Check if we need to load an existing quiz result
      this.route.queryParams.subscribe(params => {
        const viewResultId = params['viewResult'];
        if (viewResultId) {
          this.loadExistingQuizResult(parseInt(viewResultId));
        } else {
          // Load available subjects from student's schedule
          this.loadSubjects();
        }
      });
    }
  }
  
  loadSubjects(): void {
    this.loadingSubjects = true;
    this.http.get<any>(`https://integrationprojectbackend.onrender.com/api/quiz/subjects/${this.studentCin}`)
      .subscribe({
        next: (response) => {
          if (response.success && response.subjects) {
            this.availableSubjects = response.subjects;
            console.log('Available subjects:', this.availableSubjects);
          }
          this.loadingSubjects = false;
        },
        error: (err) => {
          console.error('Error loading subjects:', err);
          this.loadingSubjects = false;
          // Continue even if subjects fail to load
        }
      });
  }

  generateQuiz(): void {
    if (!this.studentCin) {
      this.error = 'Student CIN not found. Please login again.';
      return;
    }

    if (!this.subject || !this.topic) {
      this.error = 'Please enter subject and topic';
      return;
    }

    this.loading = true;
    this.error = '';

    const requestBody = {
      subject: this.subject,
      topic: this.topic,
      numQuestions: this.numQuestions
    };

    console.log('Generating quiz for student CIN:', this.studentCin);
    console.log('Request URL:', `https://integrationprojectbackend.onrender.com/api/quiz/generate/${this.studentCin}`);

    this.http.post<any>(`https://integrationprojectbackend.onrender.com/api/quiz/generate/${this.studentCin}`, requestBody)
      .subscribe({
        next: (response) => {
          console.log('Quiz generation response:', response);
          if (response.success) {
            this.quiz = {
              quizId: response.quizId,
              subject: this.subject,
              topic: this.topic,
              questions: response.questions
            };
            this.currentQuestionIndex = 0;
            this.submitted = false;
            this.score = null;
          } else {
            this.error = 'Failed to generate quiz';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error generating quiz:', err);
          console.error('Error details:', err.error);
          this.error = `Error generating quiz: ${err.error?.message || err.message || 'Please try again.'}`;
          this.loading = false;
        }
      });
  }

  selectAnswer(questionIndex: number, answer: string): void {
    this.answers[questionIndex] = answer;
  }

  nextQuestion(): void {
    if (this.quiz && this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitQuiz(): void {
    if (!this.quiz) return;

    // Check if all questions are answered
    const unanswered = this.quiz.questions.findIndex((_, index) => !this.answers[index]);
    if (unanswered !== -1) {
      this.error = `Please answer question ${unanswered + 1}`;
      return;
    }

    this.loading = true;
    this.error = '';

    // Format answers for backend with actual question IDs
    const formattedAnswers = this.quiz.questions.map((q, index) => ({
      questionId: q.id?.toString() || index.toString(),
      answer: this.answers[index]
    }));

    console.log('=== SUBMITTING QUIZ ===');
    console.log('Formatted answers:', formattedAnswers);
    console.log('Quiz questions BEFORE submit:', this.quiz.questions.map(q => ({ 
      id: q.id, 
      correctAnswer: q.correctAnswer,
      isCorrect: q.isCorrect 
    })));

    const requestBody = {
      answers: formattedAnswers
    };

    this.http.post<any>(`https://integrationprojectbackend.onrender.com/api/quiz/submit/${this.quiz.quizId}`, requestBody)
      .subscribe({
        next: (response) => {
          console.log('=== SUBMIT RESPONSE ===', response);
          if (response.success) {
            this.submitted = true;
            this.score = response.score;
            this.correctAnswers = response.correctAnswers;
            this.totalQuestions = response.totalQuestions;
            
            console.log('Quiz state BEFORE loadQuizResult:', this.quiz!.questions.map(q => ({
              id: q.id,
              isCorrect: q.isCorrect
            })));
            
            // Load full quiz result to show correct/incorrect answers
            this.loadQuizResult(this.quiz!.quizId);
          } else {
            this.error = 'Failed to submit quiz';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error submitting quiz:', err);
          this.error = 'Error submitting quiz. Please try again.';
          this.loading = false;
        }
      });
  }

  loadQuizResult(quizId: number): void {
    this.http.get<any>(`https://integrationprojectbackend.onrender.com/api/quiz/result/${quizId}`)
      .subscribe({
        next: (response) => {
          console.log('=== QUIZ RESULT RESPONSE ===');
          console.log('Full response:', JSON.stringify(response, null, 2));
          
          if (response.success && this.quiz) {
            // Update questions with correct/incorrect info by matching IDs
            response.questions.forEach((resultQ: any, index: number) => {
              const matchingQuestion = this.quiz!.questions.find(q => q.id === resultQ.id);
              if (matchingQuestion) {
                matchingQuestion.studentAnswer = resultQ.studentAnswer;
                
                // Convert to boolean explicitly (MySQL bit(1) comes as 1/0 instead of true/false)
                const originalValue = resultQ.isCorrect;
                const convertedValue = Boolean(resultQ.isCorrect);
                matchingQuestion.isCorrect = convertedValue;
                
                console.log(`Question ${index + 1} (ID: ${resultQ.id}):`);
                console.log(`  - Raw isCorrect: ${originalValue} (type: ${typeof originalValue})`);
                console.log(`  - Converted to: ${convertedValue} (type: ${typeof convertedValue})`);
                console.log(`  - Student answer: ${resultQ.studentAnswer}`);
                console.log(`  - Correct answer: ${resultQ.correctAnswer}`);
                console.log(`  - Match: ${resultQ.studentAnswer === resultQ.correctAnswer}`);
              } else {
                console.warn(`No matching question found for ID: ${resultQ.id}`);
              }
            });
            
            console.log('=== FINAL QUIZ STATE ===');
            this.quiz.questions.forEach((q, i) => {
              console.log(`Q${i + 1}: isCorrect=${q.isCorrect} (${typeof q.isCorrect})`);
            });
          }
        },
        error: (err) => {
          console.error('Error loading quiz result:', err);
        }
      });
  }

  // Load an existing quiz result from history
  loadExistingQuizResult(quizId: number): void {
    this.loading = true;
    this.http.get<any>(`https://integrationprojectbackend.onrender.com/api/quiz/result/${quizId}`)
      .subscribe({
        next: (response) => {
          console.log('Loading existing quiz result:', response);
          if (response.success) {
            // Set quiz data
            this.quiz = {
              quizId: response.quizId,
              subject: response.subject,
              topic: response.topic,
              questions: response.questions.map((q: any) => ({
                id: q.id,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                studentAnswer: q.studentAnswer,
                isCorrect: Boolean(q.isCorrect)
              }))
            };

            // Set score data
            this.score = response.score;
            this.correctAnswers = response.correctAnswers;
            this.totalQuestions = response.totalQuestions;
            this.submitted = true;
            
            this.loading = false;
          } else {
            this.error = 'Failed to load quiz result';
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error loading existing quiz:', err);
          this.error = 'Error loading quiz result. Please try again.';
          this.loading = false;
        }
      });
  }

  completeRevision(): void {
    if (!this.quiz) return;

    const requestBody = {
      subject: this.quiz.subject,
      topic: this.quiz.topic,
      quizId: this.quiz.quizId
    };

    this.http.post<any>(`https://integrationprojectbackend.onrender.com/api/quiz/complete-revision/${this.studentCin}`, requestBody)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toast.show('Revision marked as completed! Great job! 🎉', 'success');
            setTimeout(() => {
              this.resetQuiz();
            }, 2000);
          } else {
            this.toast.show('Failed to mark revision as complete', 'error');
            this.error = 'Failed to mark revision as complete';
          }
        },
        error: (err) => {
          console.error('Error completing revision:', err);
          this.toast.show('Error marking revision as complete', 'error');
          this.error = 'Error marking revision as complete';
        }
      });
  }

  resetQuiz(): void {
    this.quiz = null;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.submitted = false;
    this.score = null;
    this.correctAnswers = null;
    this.totalQuestions = null;
    this.subject = '';
    this.topic = '';
  }

  get currentQuestion(): QuizQuestion | null {
    return this.quiz ? this.quiz.questions[this.currentQuestionIndex] : null;
  }

  get progress(): number {
    return this.quiz ? ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100 : 0;
  }

  get isLastQuestion(): boolean {
    return this.quiz ? this.currentQuestionIndex === this.quiz.questions.length - 1 : false;
  }

  get allQuestionsAnswered(): boolean {
    return this.quiz ? this.quiz.questions.every((_, index) => this.answers[index]) : false;
  }

  getOptionText(question: QuizQuestion | null, option: string): string {
    return question?.options[option] || '';
  }
}
