import { User, type IUserDocument } from '../models/user.model.ts';

export type CreateUserData = {
  fullname: string;
  email: string;
  password: string;
};

export class UserRepository {
  private readonly userModel = User;

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findById(userId: string): Promise<IUserDocument | null> {
    return this.userModel.findById(userId);
  }

  async findSafeById(userId: string): Promise<IUserDocument | null> {
    return this.userModel.findById(userId).select('-password');
  }

  async create(data: CreateUserData): Promise<IUserDocument> {
    return this.userModel.create(data);
  }
}
