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
