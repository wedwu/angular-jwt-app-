export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id:        number;
  username:  string;
  email:     string;
  role:      UserRole;
  firstName: string;
  lastName:  string;
  isActive:  boolean;
  createdAt: string;
}

export interface CreateUserDto {
  username:  string;
  email:     string;
  role:      UserRole;
  firstName: string;
  lastName:  string;
  password:  string;
}

export interface UpdateUserDto {
  email?:     string;
  role?:      UserRole;
  firstName?: string;
  lastName?:  string;
  isActive?:  boolean;
}
