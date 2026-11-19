import type { IResourceEdge, IResourceNode } from '../models/appSnapShot.model.ts';
import type { IAWSAccount } from '../models/awsAccount.model.ts';
import { AppSnapshotRepository } from '../repositories/appSnapshot.repository.ts';
import { AWSAccountRepository } from '../repositories/awsAccount.repository.ts';
import { AppError } from '../utils/AppError.ts';
import { decrypt, encrypt } from '../utils/encryption.ts';
import { assumeRole, fetchAppTags, fetchTaggedResources } from './aws.service.ts';
import { buildGraph } from './graph.service.ts';

export type ConnectAWSAccountPayload = {
  accountName: string;
  roleArn: string;
  awsAccountId: string;
  region: string;
};

export type AWSAccountSummary = {
  _id: string;
  accountName: string;
  awsAccountId: string;
  region: string;
  isActive: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
};

export type AWSGraphResponse = {
  nodes: IResourceNode[];
  edges: IResourceEdge[];
  appTag: string;
  lastFetchedAt: Date;
  cached: boolean;
};

export class AWSAccountService {
  private readonly accountRepository: AWSAccountRepository;
  private readonly snapshotRepository: AppSnapshotRepository;

  constructor(
    accountRepository: AWSAccountRepository = new AWSAccountRepository(),
    snapshotRepository: AppSnapshotRepository = new AppSnapshotRepository()
  ) {
    this.accountRepository = accountRepository;
    this.snapshotRepository = snapshotRepository;
  }

  private async getAccount(userId: string, accountId: string): Promise<IAWSAccount> {
    const account = await this.accountRepository.findByUserAndId(userId, accountId);

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    return account;
  }

  private async getAssumedCredentials(roleArn: string, region: string) {
    try {
      return await assumeRole(roleArn, region);
    } catch {
      throw new AppError('Could not assume the IAM role. Please check the ARN and trust policy.', 400);
    }
  }

  private toAccountSummary(account: IAWSAccount): AWSAccountSummary {
    return {
      _id: account._id.toString(),
      accountName: account.accountName,
      awsAccountId: account.awsAccountId,
      region: account.region,
      isActive: account.isActive,
      lastSyncedAt: account.lastSyncedAt,
      createdAt: account.createdAt,
    };
  }

  async connectAccount(userId: string, payload: ConnectAWSAccountPayload): Promise<AWSAccountSummary> {
    await this.getAssumedCredentials(payload.roleArn, payload.region);

    const account = await this.accountRepository.upsertByUserAndName({
      userId,
      accountName: payload.accountName,
      encryptedRoleArn: encrypt(payload.roleArn),
      awsAccountId: payload.awsAccountId,
      region: payload.region,
      isActive: true,
    });

    if (!account) {
      throw new AppError('Failed to connect AWS account', 500);
    }

    return this.toAccountSummary(account);
  }

  async listAccounts(userId: string): Promise<AWSAccountSummary[]> {
    const accounts = await this.accountRepository.listActiveByUser(userId);

    return accounts.map((account) => this.toAccountSummary(account));
  }

  async deleteAccount(userId: string, accountId: string): Promise<void> {
    const account = await this.accountRepository.deactivateByUserAndId(userId, accountId);

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    await this.snapshotRepository.deleteByUserAndAccount(userId, accountId);
  }

  async listApps(userId: string, accountId: string, tagKey = 'Application'): Promise<string[]> {
    const account = await this.getAccount(userId, accountId);
    const creds = await this.getAssumedCredentials(decrypt(account.encryptedRoleArn), account.region);

    return fetchAppTags(creds, account.region, tagKey);
  }

  async getAppGraph(
    userId: string,
    accountId: string,
    appTag: string,
    tagKey = 'Application',
    refresh = false,
  ): Promise<AWSGraphResponse> {
    const account = await this.getAccount(userId, accountId);
    const accountIdString = account._id.toString();

    if (!refresh) {
      const cached = await this.snapshotRepository.findRecentSnapshot({
        userId,
        awsAccountId: accountIdString,
        appTag,
        tagKey,
        withinMinutes: 10,
      });

      if (cached) {
        return {
          nodes: cached.nodes,
          edges: cached.edges,
          appTag: cached.appTag,
          lastFetchedAt: cached.lastFetchedAt,
          cached: true,
        };
      }
    }

    const creds = await this.getAssumedCredentials(decrypt(account.encryptedRoleArn), account.region);
    const rawResources = await fetchTaggedResources(creds, account.region, tagKey, appTag);
    const { nodes, edges } = buildGraph(rawResources);

    const snapshot = await this.snapshotRepository.upsertSnapshot({
      userId,
      awsAccountId: accountIdString,
      appTag,
      tagKey,
      nodes,
      edges,
      rawResources,
    });

    if (!snapshot) {
      throw new AppError('Failed to build graph', 500);
    }

    await this.accountRepository.updateLastSyncedAt(userId, accountIdString, new Date());

    return {
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      appTag,
      lastFetchedAt: snapshot.lastFetchedAt,
      cached: false,
    };
  }
}
