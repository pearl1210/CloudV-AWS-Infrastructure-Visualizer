import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { AppError } from '../utils/AppError.ts';
import { AWSAccountService } from '../services/awsAccount.service.ts';

const connectSchema = z.object({
  accountName: z.string().trim().min(1, 'Account name is required').max(60),
  roleArn: z.string().regex(/^arn:aws:iam::\d{12}:role\/.+$/, 'Invalid IAM Role ARN format'),
  awsAccountId: z.string().regex(/^\d{12}$/, 'Must be a 12-digit AWS Account ID'),
  region: z.string().trim().min(1).default('us-east-1'),
});

export class AwsController {
  private readonly awsAccountService: AWSAccountService;

  constructor(awsAccountService: AWSAccountService = new AWSAccountService()) {
    this.awsAccountService = awsAccountService;
  }

  private getSingleParam(value: string | string[] | undefined, paramName: string): string {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    if (!normalizedValue) {
      throw new AppError(`Missing ${paramName}`, 400);
    }

    return normalizedValue;
  }

  connectAWSAccount = asyncHandler(async (req: Request, res: Response) => {
    const payload = connectSchema.parse(req.body);
    const account = await this.awsAccountService.connectAccount(req.userId, payload);

    res.status(201).json({
      message: 'AWS account connected successfully',
      account,
    });
  });

  listAWSAccounts = asyncHandler(async (req: Request, res: Response) => {
    const accounts = await this.awsAccountService.listAccounts(req.userId);

    res.json({ accounts });
  });

  deleteAWSAccount = asyncHandler(async (req: Request, res: Response) => {
    const accountId = this.getSingleParam(req.params.id, 'account id');
    await this.awsAccountService.deleteAccount(req.userId, accountId);

    res.json({ message: 'Account disconnected' });
  });

  listApps = asyncHandler(async (req: Request, res: Response) => {
    const accountId = this.getSingleParam(req.params.id, 'account id');
    const tagKey = typeof req.query.tagKey === 'string' && req.query.tagKey.trim() ? req.query.tagKey : 'Application';
    const apps = await this.awsAccountService.listApps(req.userId, accountId, tagKey);

    res.json({ apps, tagKey });
  });

  getAppGraph = asyncHandler(async (req: Request, res: Response) => {
    const accountId = this.getSingleParam(req.params.id, 'account id');
    const appTag = this.getSingleParam(req.params.appTag, 'app tag');
    const tagKey = typeof req.query.tagKey === 'string' && req.query.tagKey.trim() ? req.query.tagKey : 'Application';
    const refresh = req.query.refresh === 'true';
    const graph = await this.awsAccountService.getAppGraph(req.userId, accountId, appTag, tagKey, refresh);

    res.json(graph);
  });
}
