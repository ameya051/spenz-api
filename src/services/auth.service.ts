import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto, AuthResponse, LoginUserDto } from '../types/auth.types';
import { TokenService } from './token.service';
import { AppError } from '../errors/AppError';

const prisma = new PrismaClient();

export class AuthService {
  private tokenService = new TokenService();

  async register(userData: RegisterUserDto): Promise<AuthResponse> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });

    const { accessToken, refreshToken } = this.tokenService.generateTokens(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async login(credentials: LoginUserDto): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const validPassword = await bcrypt.compare(credentials.password, user.password);
    if (!validPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const { accessToken, refreshToken } = this.tokenService.generateTokens(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = this.tokenService.verifyToken(refreshToken, 'refresh');
    const { accessToken } = this.tokenService.generateTokens(payload.userId);
    return { accessToken };
  }
}
