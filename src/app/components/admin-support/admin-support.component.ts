import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService } from '../../services/support.service';
import { AuthService } from '../../services/auth.service';
import { 
  SupportTicket, 
  SupportMessage, 
  TicketStatus,
  TicketPriority 
} from '../../models/support.model';

@Component({
  selector: 'app-admin-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-support.component.html',
  styleUrl: './admin-support.component.css'
})
export class AdminSupportComponent implements OnInit {
  tickets: SupportTicket[] = [];
  selectedTicket: SupportTicket | null = null;
  messages: SupportMessage[] = [];
  newMessage: string = '';
  
  loading: boolean = false;
  messageLoading: boolean = false;
  
  successMessage: string = '';
  errorMessage: string = '';

  // Filters
  filterStatus: string = 'all';
  filterPriority: string = 'all';
  searchQuery: string = '';

  // Enums for template
  TicketStatus = TicketStatus;
  TicketPriority = TicketPriority;

  constructor(
    private supportService: SupportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllTickets();
  }

  loadAllTickets(): void {
    this.loading = true;
    this.supportService.getAllTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.showError('Failed to load tickets');
        this.loading = false;
      }
    });
  }

  get filteredTickets(): SupportTicket[] {
    return this.tickets.filter(ticket => {
      // Status filter
      if (this.filterStatus !== 'all' && ticket.status !== this.filterStatus) {
        return false;
      }
      
      // Priority filter
      if (this.filterPriority !== 'all' && ticket.priority !== this.filterPriority) {
        return false;
      }
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return ticket.subject.toLowerCase().includes(query) ||
               ticket.description.toLowerCase().includes(query) ||
               ticket.userName.toLowerCase().includes(query);
      }
      
      return true;
    });
  }

  selectTicket(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.loadMessages(ticket.id);
  }

  loadMessages(ticketId: number): void {
    this.messageLoading = true;
    this.supportService.getTicketMessages(ticketId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.messageLoading = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.showError('Failed to load messages');
        this.messageLoading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.selectedTicket || !this.newMessage.trim()) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.showError('User not authenticated');
      return;
    }

    this.supportService.sendMessage(
      this.selectedTicket.id,
      this.newMessage,
      currentUser.id
    ).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.newMessage = '';
        this.showSuccess('Message sent successfully');
        
        // Refresh tickets to update message count
        this.loadAllTickets();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.showError('Failed to send message');
      }
    });
  }

  updateTicketStatus(status: TicketStatus): void {
    if (!this.selectedTicket) {
      return;
    }

    this.supportService.updateTicketStatus(this.selectedTicket.id, status).subscribe({
      next: () => {
        this.showSuccess(`Ticket marked as ${this.formatStatus(status)}`);
        this.selectedTicket!.status = status;
        
        // Refresh tickets list
        this.loadAllTickets();
      },
      error: (error) => {
        console.error('Error updating ticket status:', error);
        this.showError('Failed to update ticket status');
      }
    });
  }

  updateTicketPriority(priority: TicketPriority): void {
    if (!this.selectedTicket) {
      return;
    }

    this.supportService.updateTicketPriority(this.selectedTicket.id, priority).subscribe({
      next: () => {
        this.showSuccess(`Priority updated to ${this.formatPriority(priority)}`);
        this.selectedTicket!.priority = priority;
        
        // Refresh tickets list
        this.loadAllTickets();
      },
      error: (error) => {
        console.error('Error updating ticket priority:', error);
        this.showError('Failed to update ticket priority');
      }
    });
  }

  backToList(): void {
    this.selectedTicket = null;
    this.messages = [];
    this.newMessage = '';
  }

  clearFilters(): void {
    this.filterStatus = 'all';
    this.filterPriority = 'all';
    this.searchQuery = '';
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  formatPriority(priority: string): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
      }
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return d.toLocaleDateString();
    }
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  // Stats for dashboard
  get totalTickets(): number {
    return this.tickets.length;
  }

  get openTickets(): number {
    return this.tickets.filter(t => t.status === TicketStatus.OPEN).length;
  }

  get inProgressTickets(): number {
    return this.tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
  }

  get urgentTickets(): number {
    return this.tickets.filter(t => t.priority === TicketPriority.URGENT).length;
  }
}
