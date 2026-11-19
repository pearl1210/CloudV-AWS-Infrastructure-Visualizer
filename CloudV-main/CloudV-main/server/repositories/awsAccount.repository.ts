import { AWSAccount, type IAWSAccount } from '../models/awsAccount.model.ts';

export type UpsertAWSAccountData = {
  userId: string;
  accountName: string;
  encryptedRoleArn: string;
  awsAccountId: string;
  region: string;
  isActive?: boolean;
};

export class AWSAccountRepository {
  private readonly awsAccountModel = AWSAccount;

  async findByUserAndId(userId: string, accountId: string): Promise<IAWSAccount | null> {
    return this.awsAccountModel.findOne({ _id: accountId, userId });
  }

  async findByUserAndName(userId: string, accountName: string): Promise<IAWSAccount | null> {
    return this.awsAccountModel.findOne({ userId, accountName });
  }

  async upsertByUserAndName(data: UpsertAWSAccountData): Promise<IAWSAccount | null> {
    return this.awsAccountModel.findOneAndUpdate(
      { userId: data.userId, accountName: data.accountName },
      {
        userId: data.userId,
        accountName: data.accountName,
        encryptedRoleArn: data.encryptedRoleArn,
        awsAccountId: data.awsAccountId,
        region: data.region,
        isActive: data.isActive ?? true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }

  async listActiveByUser(userId: string): Promise<IAWSAccount[]> {
    return this.awsAccountModel.find({ userId, isActive: true })
      .select('-encryptedRoleArn')
      .sort({ createdAt: -1 });
  }

  async deactivateByUserAndId(userId: string, accountId: string): Promise<IAWSAccount | null> {
    return this.awsAccountModel.findOneAndUpdate(
      { _id: accountId, userId },
      { isActive: false }
    );
  }

  async updateLastSyncedAt(userId: string, accountId: string, lastSyncedAt: Date): Promise<IAWSAccount | null> {
    return this.awsAccountModel.findOneAndUpdate(
      { _id: accountId, userId },
      { lastSyncedAt }
    );
  }
}
