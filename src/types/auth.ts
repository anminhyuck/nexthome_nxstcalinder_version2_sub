export interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}
