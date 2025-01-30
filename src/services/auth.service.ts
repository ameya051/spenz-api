import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { RegisterUserDto, AuthResponse, LoginUserDto } from '../types/auth.types';
import { TokenService } from './token.service';
import { AppError } from '../errors/AppError';

const prisma = new PrismaClient();

export class AuthService {
  private tokenService = new TokenService();

  private setTokenCookie(res: Response, token: string) {
    res.cookie('accessToken', token, {
      httpOnly: true,
      maxAge: 10 * 1000 // 10 seconds, change to 15 mins later
    });
  }

  async register(userData: RegisterUserDto): Promise<Omit<AuthResponse, 'accessToken' | 'refreshToken'>> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async login(credentials: LoginUserDto, res: Response): Promise<AuthResponse> {
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

    this.setTokenCookie(res, accessToken);

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

  async userInfo(req: Request) {
    const accessToken = req.cookies.accessToken;
    if(!accessToken) {
      throw new AppError('Unauthorized', 401);
    }
    const { userId } = this.tokenService.verifyToken(accessToken, 'access');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }
}
