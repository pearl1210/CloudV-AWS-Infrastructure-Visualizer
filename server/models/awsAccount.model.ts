import mongoose, { Document, Schema } from 'mongoose';

export interface IAWSAccount extends Document {
  userId: mongoose.Types.ObjectId;
  accountName: string;
  // We store the IAM Role ARN (encrypted) - NEVER access keys
  encryptedRoleArn: string;
  // AWS Account ID (not secret)
  awsAccountId: string;
  // AWS region preference
  region: string;
  isActive: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
}

const awsAccountSchema = new Schema<IAWSAccount>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  accountName: { type: String, required: true, trim: true },
  encryptedRoleArn: { type: String, required: true },
  awsAccountId: { type: String, required: true },
  region: { type: String, default: 'us-east-1' },
  isActive: { type: Boolean, default: true },
  lastSyncedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Compound index: one user, unique account name
awsAccountSchema.index({ userId: 1, accountName: 1 }, { unique: true });

export const AWSAccount = mongoose.model<IAWSAccount>('AWSAccount', awsAccountSchema);