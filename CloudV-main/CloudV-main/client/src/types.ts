export type ResourceType =
  | 'ec2'
  | 'rds'
  | 's3'
  | 'vpc'
  | 'subnet'
  | 'elb'
  | 'lambda'
  | 'igw'
  | 'security-group';

export interface ResourceNode {
  id: string;
  type: ResourceType;
  label: string;
  data: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface ResourceEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface AWSAccount {
  _id: string;
  accountName: string;
  awsAccountId: string;
  region: string;
  isActive: boolean;
  lastSyncedAt?: string;
  createdAt: string;
}

export interface AppGraph {
  nodes: ResourceNode[];
  edges: ResourceEdge[];
  appTag: string;
  lastFetchedAt: string;
  cached: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}