import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  password: z.string().min(6).max(100)
});

export const refreshSchema = z.object({
  refreshToken: z.string()
});