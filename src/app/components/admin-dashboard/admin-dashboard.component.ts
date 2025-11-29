import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { UserManagementDTO, UserStatistics } from '../../models/auth.model';
import { AdminNavbarComponent } from '../shared/admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminNavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: UserManagementDTO[] = [];
  filteredUsers: UserManagementDTO[] = [];
  statistics: UserStatistics | null = null;
  
  // Filters
  selectedRole: string = '';
  selectedSuspendedFilter: string = '';
  searchText: string = '';
  
  // UI state
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Selected user for actions
  selectedUser: UserManagementDTO | null = null;
  showConfirmDialog: boolean = false;
  confirmAction: 'suspend' | 'unsuspend' | 'delete' | 'changeRole' | null = null;
  newRole: 'ETUDIANT' | 'PARENT' | 'ADMINISTRATOR' | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStatistics();
  }

  /**
   * Load all users with current filters
   */
  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    
    const role = this.selectedRole ? this.selectedRole as any : undefined;
    const suspended = this.selectedSuspendedFilter === 'true' ? true : 
                     this.selectedSuspendedFilter === 'false' ? false : undefined;
    const search = this.searchText.trim() || undefined;

    this.adminService.getAllUsers(role, suspended, search).subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load users';
        this.loading = false;
      }
    });
  }

  /**
   * Load statistics
   */
  loadStatistics(): void {
    this.adminService.getStatistics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.statistics = response.data as UserStatistics;
        }
      },
      error: (error) => {
        console.error('Failed to load statistics', error);
      }
    });
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    this.loadUsers();
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.selectedRole = '';
    this.selectedSuspendedFilter = '';
    this.searchText = '';
    this.loadUsers();
  }

  /**
   * Show confirmation dialog
   */
  showConfirm(user: UserManagementDTO, action: 'suspend' | 'unsuspend' | 'delete' | 'changeRole', newRole?: 'ETUDIANT' | 'PARENT' | 'ADMINISTRATOR'): void {
    this.selectedUser = user;
    this.confirmAction = action;
    this.newRole = newRole || null;
    this.showConfirmDialog = true;
  }

  /**
   * Close confirmation dialog
   */
  closeConfirm(): void {
    this.showConfirmDialog = false;
    this.selectedUser = null;
    this.confirmAction = null;
    this.newRole = null;
  }

  /**
   * Confirm action
   */
  confirmActionExecution(): void {
    if (!this.selectedUser || !this.confirmAction) return;

    switch (this.confirmAction) {
      case 'suspend':
        this.suspendUser(this.selectedUser.id, true);
        break;
      case 'unsuspend':
        this.suspendUser(this.selectedUser.id, false);
        break;
      case 'delete':
        this.deleteUser(this.selectedUser.id);
        break;
      case 'changeRole':
        if (this.newRole) {
          this.updateRole(this.selectedUser.id, this.newRole);
        }
        break;
    }

    this.closeConfirm();
  }

  /**
   * Suspend or unsuspend user
   */
  suspendUser(userId: number, suspended: boolean): void {
    this.adminService.suspendUser(userId, suspended).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loadUsers();
        this.loadStatistics();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update user status';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  /**
   * Update user role
   */
  updateRole(userId: number, role: 'ETUDIANT' | 'PARENT' | 'ADMINISTRATOR'): void {
    this.adminService.updateUserRole(userId, role).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loadUsers();
        this.loadStatistics();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update user role';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  /**
   * Delete user
   */
  deleteUser(userId: number): void {
    this.adminService.deleteUser(userId).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loadUsers();
        this.loadStatistics();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to delete user';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ETUDIANT': 'Étudiant',
      'PARENT': 'Parent',
      'ADMINISTRATOR': 'Administrateur'
    };
    return roleMap[role] || role;
  }

  /**
   * Get role badge class
   */
  getRoleBadgeClass(role: string): string {
    const classMap: { [key: string]: string } = {
      'ETUDIANT': 'badge-student',
      'PARENT': 'badge-parent',
      'ADMINISTRATOR': 'badge-admin'
    };
    return classMap[role] || '';
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(suspended: boolean): string {
    return suspended ? 'badge-suspended' : 'badge-active';
  }
}
