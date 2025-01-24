import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto, AuthResponse } from '../types/auth.types';
import { TokenService } from './token.service';

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
        username: user.username,
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
