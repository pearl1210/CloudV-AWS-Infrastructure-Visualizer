import mongoose, { Document, Schema } from 'mongoose';

export interface IResourceNode {
  id: string;
  type: 'ec2' | 'rds' | 's3' | 'vpc' | 'subnet' | 'elb' | 'lambda' | 'igw' | 'security-group';
  label: string;
  data: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface IResourceEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface IAppSnapshot extends Document {
  userId: mongoose.Types.ObjectId;
  awsAccountId: mongoose.Types.ObjectId;
  appTag: string;        // e.g. "app-1"
  tagKey: string;        // e.g. "Application"
  nodes: IResourceNode[];
  edges: IResourceEdge[];
  rawResources: Record<string, unknown>;
  lastFetchedAt: Date;
  createdAt: Date;
}

const resourceNodeSchema = new Schema({
  id: String,
  type: String,
  label: String,
  data: Schema.Types.Mixed,
  position: { x: Number, y: Number },
}, { _id: false });

const resourceEdgeSchema = new Schema({
  id: String,
  source: String,
  target: String,
  label: String,
  type: String,
}, { _id: false });

const appSnapshotSchema = new Schema<IAppSnapshot>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  awsAccountId: { type: Schema.Types.ObjectId, ref: 'AWSAccount', required: true },
  appTag: { type: String, required: true },
  tagKey: { type: String, required: true, default: 'Application' },
  nodes: [resourceNodeSchema],
  edges: [resourceEdgeSchema],
  rawResources: { type: Schema.Types.Mixed },
  lastFetchedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

appSnapshotSchema.index({ userId: 1, awsAccountId: 1, appTag: 1 }, { unique: true });

export const AppSnapshot = mongoose.model<IAppSnapshot>('AppSnapshot', appSnapshotSchema);