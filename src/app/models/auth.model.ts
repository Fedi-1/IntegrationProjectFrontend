export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cin: string;
  phoneNumber: string;
  age: number;
  role: 'ETUDIANT' | 'PARENT' | 'ADMINISTRATOR';
  parentCin?: string;
  maxStudyDuration?: number;
  preparationTimeMinutes?: number;
}

export interface UserDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  cin: string;
  phoneNumber: string;
  age: number;
  role: 'ETUDIANT' | 'PARENT' | 'ADMINISTRATOR';
  parentCin?: string;
  maxStudyDuration?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserDTO;
}

// Admin-specific models
export interface UserManagementDTO {
  id: number;
  cin: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phoneNumber: string;
  role: 'ETUDIANT' | 'PARENT' | 'ADMINISTRATOR';
  suspended: boolean;
  dtype: string;
}

export interface UpdateRoleRequest {
  role: 'ETUDIANT' | 'PARENT' | 'ADMINISTRATOR';
}

export interface SuspendUserRequest {
  suspended: boolean;
}

export interface AdminResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UserStatistics {
  totalUsers: number;
  totalStudents: number;
  totalParents: number;
  totalAdmins: number;
  suspendedUsers: number;
}
