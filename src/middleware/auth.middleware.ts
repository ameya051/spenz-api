import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

const tokenService = new TokenService();

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const payload = tokenService.verifyToken(token, 'access');
    req['user'] = payload;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid access token' });
  }
};