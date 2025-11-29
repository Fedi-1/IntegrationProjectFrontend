export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface SupportMessage {
  id: number;
  ticketId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  isAdminMessage: boolean;
}

export interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: number;
  createdByName: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  messages?: SupportMessage[];
  userName: string; // For admin view
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority: TicketPriority;
}

export interface SendMessageRequest {
  message: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface SupportStatistics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
}
