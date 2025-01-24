export interface RegisterUserDto {
  username: string;
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
  }
}

export interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
}