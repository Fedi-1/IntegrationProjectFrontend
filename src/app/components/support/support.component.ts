import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupportService } from '../../services/support.service';
import { AuthService } from '../../services/auth.service';
import { SupportTicket, CreateTicketRequest, SendMessageRequest, TicketPriority, TicketStatus } from '../../models/support.model';
import { UserDTO } from '../../models/auth.model';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {
  currentUser: UserDTO | null = null;
  tickets: SupportTicket[] = [];
  selectedTicket: SupportTicket | null = null;
  
  // UI State
  loading: boolean = false;
  showCreateTicket: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Create Ticket Form
  newTicket: CreateTicketRequest = {
    subject: '',
    description: '',
    priority: TicketPriority.MEDIUM
  };
  
  // Message Form
  newMessage: string = '';
  
  // Enums for template
  TicketPriority = TicketPriority;
  TicketStatus = TicketStatus;

  constructor(
    private supportService: SupportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadTickets();
    }
  }

  /**
   * Load user tickets
   */
  loadTickets(): void {
    if (!this.currentUser) return;
    
    this.loading = true;
    this.supportService.getUserTickets(this.currentUser.id).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
      }
    });
  }

  /**
   * Open create ticket form
   */
  openCreateTicket(): void {
    this.showCreateTicket = true;
    this.newTicket = {
      subject: '',
      description: '',
      priority: TicketPriority.MEDIUM
    };
  }

  /**
   * Close create ticket form
   */
  closeCreateTicket(): void {
    this.showCreateTicket = false;
  }

  /**
   * Create new ticket
   */
  createTicket(): void {
    if (!this.currentUser) return;
    
    if (!this.newTicket.subject.trim() || !this.newTicket.description.trim()) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    this.supportService.createTicket(this.currentUser.id, this.newTicket).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.closeCreateTicket();
        this.loadTickets();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
  }

  /**
   * Select a ticket to view conversation
   */
  selectTicket(ticket: SupportTicket): void {
    this.supportService.getTicketById(ticket.id).subscribe({
      next: (fullTicket) => {
        this.selectedTicket = fullTicket;
        this.scrollToBottom();
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
  }

  /**
   * Go back to ticket list
   */
  backToList(): void {
    this.selectedTicket = null;
    this.newMessage = '';
  }

  /**
   * Send message
   */
  sendMessage(): void {
    if (!this.currentUser || !this.selectedTicket || !this.newMessage.trim()) return;

    this.supportService.sendMessage(this.selectedTicket.id, this.newMessage, this.currentUser.id).subscribe({
      next: (message) => {
        // Add the new message to the current ticket's messages
        if (this.selectedTicket && this.selectedTicket.messages) {
          this.selectedTicket.messages.push(message);
        }
        this.newMessage = '';
        this.showSuccess('Message sent successfully');
      },
      error: (error) => {
        this.showError('Failed to send message');
      }
    });
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: TicketStatus): string {
    const statusMap: { [key: string]: string } = {
      'OPEN': 'status-open',
      'IN_PROGRESS': 'status-in-progress',
      'RESOLVED': 'status-resolved',
      'CLOSED': 'status-closed'
    };
    return statusMap[status] || '';
  }

  /**
   * Get priority badge class
   */
  getPriorityClass(priority: TicketPriority): string {
    const priorityMap: { [key: string]: string } = {
      'LOW': 'priority-low',
      'MEDIUM': 'priority-medium',
      'HIGH': 'priority-high',
      'URGENT': 'priority-urgent'
    };
    return priorityMap[priority] || '';
  }

  /**
   * Get status display name
   */
  getStatusDisplay(status: TicketStatus): string {
    const statusMap: { [key: string]: string } = {
      'OPEN': 'Ouvert',
      'IN_PROGRESS': 'En cours',
      'RESOLVED': 'Résolu',
      'CLOSED': 'Fermé'
    };
    return statusMap[status] || status;
  }

  /**
   * Get priority display name
   */
  getPriorityDisplay(priority: TicketPriority): string {
    const priorityMap: { [key: string]: string } = {
      'LOW': 'Faible',
      'MEDIUM': 'Moyenne',
      'HIGH': 'Haute',
      'URGENT': 'Urgente'
    };
    return priorityMap[priority] || priority;
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Aujourd\'hui ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
  }

  /**
   * Show success message
   */
  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}
