import { AppSnapshot, type IAppSnapshot, type IResourceEdge, type IResourceNode } from '../models/appSnapShot.model.ts';

export type SnapshotQuery = {
  userId: string;
  awsAccountId: string;
  appTag: string;
  tagKey: string;
  withinMinutes?: number;
};

export type SnapshotPayload = {
  userId: string;
  awsAccountId: string;
  appTag: string;
  tagKey: string;
  nodes: IResourceNode[];
  edges: IResourceEdge[];
  rawResources: unknown;
};

export class AppSnapshotRepository {
  private readonly appSnapshotModel = AppSnapshot;

  async findRecentSnapshot(query: SnapshotQuery): Promise<IAppSnapshot | null> {
    const withinMinutes = query.withinMinutes ?? 10;

    return this.appSnapshotModel.findOne({
      userId: query.userId,
      awsAccountId: query.awsAccountId,
      appTag: query.appTag,
      tagKey: query.tagKey,
      lastFetchedAt: { $gte: new Date(Date.now() - withinMinutes * 60 * 1000) },
    });
  }

  async upsertSnapshot(payload: SnapshotPayload): Promise<IAppSnapshot | null> {
    return this.appSnapshotModel.findOneAndUpdate(
      {
        userId: payload.userId,
        awsAccountId: payload.awsAccountId,
        appTag: payload.appTag,
        tagKey: payload.tagKey,
      },
      {
        nodes: payload.nodes,
        edges: payload.edges,
        rawResources: payload.rawResources,
        lastFetchedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  async deleteByUserAndAccount(userId: string, awsAccountId: string): Promise<void> {
    await this.appSnapshotModel.deleteMany({ userId, awsAccountId });
  }
}
