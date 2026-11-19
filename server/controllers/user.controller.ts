import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { generateToken } from '../utils/generateToken.ts';
import { UserService } from '../services/user.service.ts';

const signupSchema = z.object({
  fullname: z.string().trim().min(1, 'Full name is required').max(120),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService = new UserService()) {
    this.userService = userService;
  }

  signup = asyncHandler(async (req: Request, res: Response) => {
    const payload = signupSchema.parse(req.body);
    const user = await this.userService.signup(payload);

    generateToken(res, user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const payload = loginSchema.parse(req.body);
    const user = await this.userService.login(payload);

    generateToken(res, user);

    res.status(200).json({
      success: true,
      message: `Welcome back ${user.fullname}`,
      user,
    });
  });

  logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('token').status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  });

  checkAuth = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.checkAuth(req.userId);

    res.status(200).json({
      success: true,
      user,
    });
  });
}
