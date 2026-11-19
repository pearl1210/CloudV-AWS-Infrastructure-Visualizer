import bcrypt from 'bcryptjs';
import type { IUserDocument } from '../models/user.model.ts';
import { UserRepository } from '../repositories/user.repository.ts';
import { AppError } from '../utils/AppError.ts';

export type SignupPayload = {
  fullname: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  private async getSafeUser(userId: string): Promise<IUserDocument> {
    const user = await this.userRepository.findSafeById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async signup(payload: SignupPayload): Promise<IUserDocument> {
    const existingUser = await this.userRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new AppError('User already exist with this email', 400);
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const createdUser = await this.userRepository.create({
      fullname: payload.fullname,
      email: payload.email,
      password: hashedPassword,
    });

    return this.getSafeUser(createdUser._id.toString());
  }

  async login(payload: LoginPayload): Promise<IUserDocument> {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new AppError('Incorrect email or password', 400);
    }

    const isPasswordMatch = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordMatch) {
      throw new AppError('Incorrect email or password', 400);
    }

    return this.getSafeUser(user._id.toString());
  }

  async checkAuth(userId: string | undefined): Promise<IUserDocument> {
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    return this.getSafeUser(userId);
  }
}
