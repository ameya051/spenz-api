import * as jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/auth.types';

export class TokenService {
  private readonly accessSecret = process.env.JWT_ACCESS_SECRET || 'access-secret';
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

  generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId, type: 'access' } as TokenPayload,
      this.accessSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' } as TokenPayload,
      this.refreshSecret,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  verifyToken(token: string, type: 'access' | 'refresh'): TokenPayload {
    const secret = type === 'access' ? this.accessSecret : this.refreshSecret;
    return jwt.verify(token, secret) as TokenPayload;
  }
}