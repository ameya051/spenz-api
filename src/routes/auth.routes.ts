import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { validateRequest } from '../middleware/validate.middleware';
import { registerSchema, refreshSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();
const authService = new AuthService();

router.post('/register',
  validateRequest(registerSchema),
  async (req, res) => {
    try {
      const userData = req.body;
      const result = await authService.register(userData);
      res.status(201).json(result);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        res.status(400).json({ message: 'Username or email already exists' });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

router.post('/refresh',
  validateRequest(refreshSchema),
  async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      console.log(result);
      
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        maxAge: 10 * 1000 // 15 min
      }).json({ accessToken: result.accessToken });
    } catch (error) {
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  });

router.post('/login',
  validateRequest(loginSchema),
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body, res);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

router.get('/me', async (req, res) => {
  if (!req.cookies.accessToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user = await authService.userInfo(req);
  res.status(200).json(user);

})

export default router;
