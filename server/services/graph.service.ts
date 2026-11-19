import { type FetchedResources } from './aws.service.ts';
import type { IResourceNode, IResourceEdge } from '../models/appSnapShot.model.ts';
type NodeType = IResourceNode['type'];

interface LayoutConfig {
  [key: string]: { x: number; y: number; spacing: number };
}

/** Builds a positioned graph from raw AWS resources */
export const buildGraph = (resources: FetchedResources): {
  nodes: IResourceNode[];
  edges: IResourceEdge[];
} => {
  const nodes: IResourceNode[] = [];
  const edges: IResourceEdge[] = [];

  // Layout tiers (y position by resource type)
  const layout: LayoutConfig = {
    igw:            { x: 40,  y: 80,  spacing: 200 },
    vpc:            { x: 40,  y: 200, spacing: 260 },
    subnet:         { x: 60,  y: 340, spacing: 220 },
    'security-group': { x: 60, y: 460, spacing: 200 },
    ec2:            { x: 60,  y: 580, spacing: 200 },
    rds:            { x: 60,  y: 700, spacing: 220 },
    elb:            { x: 60,  y: 820, spacing: 220 },
    lambda:         { x: 60,  y: 940, spacing: 200 },
    s3:             { x: 60,  y: 1060, spacing: 180 },
  };

  const counters: Record<string, number> = {};

  const addNode = (type: NodeType, id: string, label: string, data: Record<string, unknown>) => {
    counters[type] = (counters[type] || 0);
    const cfg = layout[type] || { x: 40, y: 100, spacing: 200 };
    nodes.push({
      id,
      type,
      label,
      data,
      position: {
        x: cfg.x + counters[type] * cfg.spacing,
        y: cfg.y,
      },
    });
    counters[type]++;
  };

  const addEdge = (source: string, target: string, label?: string) => {
    edges.push({
      id: `${source}->${target}`,
      source,
      target,
      label,
    });
  };

  // Internet Gateways
  for (const igw of resources.internetGateways) {
    const id = igw.InternetGatewayId!;
    addNode('igw', id, 'Internet Gateway', {
      internetGatewayId: igw.InternetGatewayId,
      attachments: igw.Attachments,
      state: igw.Attachments?.[0]?.State,
    });

    // IGW -> VPC edge
    for (const attachment of igw.Attachments || []) {
      if (attachment.VpcId) {
        addEdge(id, attachment.VpcId, 'attached to');
      }
    }
  }

  // VPCs
  for (const vpc of resources.vpcs) {
    const id = vpc.VpcId!;
    addNode('vpc', id, getTagName(vpc.Tags) || `VPC ${id.slice(-6)}`, {
      vpcId: vpc.VpcId,
      cidrBlock: vpc.CidrBlock,
      state: vpc.State,
      isDefault: vpc.IsDefault,
      tags: vpc.Tags,
    });
  }

  // Subnets
  for (const subnet of resources.subnets) {
    const id = subnet.SubnetId!;
    addNode('subnet', id, getTagName(subnet.Tags) || `Subnet ${id.slice(-6)}`, {
      subnetId: subnet.SubnetId,
      vpcId: subnet.VpcId,
      cidrBlock: subnet.CidrBlock,
      availabilityZone: subnet.AvailabilityZone,
      availableIpAddressCount: subnet.AvailableIpAddressCount,
      mapPublicIpOnLaunch: subnet.MapPublicIpOnLaunch,
      tags: subnet.Tags,
    });

    if (subnet.VpcId) addEdge(subnet.VpcId, id, 'contains');
  }

  // Security Groups
  for (const sg of resources.securityGroups) {
    const id = sg.GroupId!;
    addNode('security-group', id, sg.GroupName || `SG ${id.slice(-6)}`, {
      groupId: sg.GroupId,
      groupName: sg.GroupName,
      description: sg.Description,
      vpcId: sg.VpcId,
      inboundRules: sg.IpPermissions?.length,
      outboundRules: sg.IpPermissionsEgress?.length,
      tags: sg.Tags,
    });

    if (sg.VpcId && resources.vpcs.find(v => v.VpcId === sg.VpcId)) {
      addEdge(sg.VpcId, id, 'has');
    }
  }

  // EC2 Instances
  for (const instance of resources.ec2Instances) {
    const id = instance.InstanceId!;
    addNode('ec2', id, getTagName(instance.Tags) || `EC2 ${id.slice(-6)}`, {
      instanceId: instance.InstanceId,
      instanceType: instance.InstanceType,
      state: instance.State?.Name,
      publicIp: instance.PublicIpAddress,
      privateIp: instance.PrivateIpAddress,
      ami: instance.ImageId,
      platform: instance.PlatformDetails,
      az: instance.Placement?.AvailabilityZone,
      launchTime: instance.LaunchTime,
      tags: instance.Tags,
    });

    if (instance.SubnetId) addEdge(instance.SubnetId, id, 'hosts');
    for (const sg of instance.SecurityGroups || []) {
      if (sg.GroupId) addEdge(id, sg.GroupId, 'uses');
    }
  }

  // RDS Instances
  for (const db of resources.rdsInstances) {
    const id = db.DBInstanceIdentifier!;
    addNode('rds', id, db.DBName || id, {
      dbInstanceId: db.DBInstanceIdentifier,
      engine: db.Engine,
      engineVersion: db.EngineVersion,
      instanceClass: db.DBInstanceClass,
      status: db.DBInstanceStatus,
      endpoint: db.Endpoint?.Address,
      port: db.Endpoint?.Port,
      multiAz: db.MultiAZ,
      storageType: db.StorageType,
      allocatedStorage: db.AllocatedStorage,
    });

    if (db.DBSubnetGroup?.VpcId) {
      const vpcId = db.DBSubnetGroup.VpcId;
      if (resources.vpcs.find(v => v.VpcId === vpcId)) {
        addEdge(vpcId, id, 'hosts DB');
      }
    }
    for (const sg of db.VpcSecurityGroups || []) {
      if (sg.VpcSecurityGroupId) addEdge(id, sg.VpcSecurityGroupId, 'uses');
    }
  }

  // Load Balancers
  for (const lb of resources.loadBalancers) {
    const id = lb.LoadBalancerArn!;
    const shortId = lb.LoadBalancerName || id.slice(-12);
    addNode('elb', id, lb.LoadBalancerName || `ELB ${shortId}`, {
      name: lb.LoadBalancerName,
      arn: lb.LoadBalancerArn,
      type: lb.Type,
      scheme: lb.Scheme,
      state: lb.State?.Code,
      dnsName: lb.DNSName,
      vpcId: lb.VpcId,
    });

    if (lb.VpcId && resources.vpcs.find(v => v.VpcId === lb.VpcId)) {
      addEdge(lb.VpcId, id, 'routes to');
    }
    for (const az of lb.AvailabilityZones || []) {
      if (az.SubnetId && resources.subnets.find(s => s.SubnetId === az.SubnetId)) {
        addEdge(id, az.SubnetId, 'in');
      }
    }
  }

  // Lambda functions
  for (const fn of resources.lambdaFunctions) {
    const id = fn.FunctionArn!;
    addNode('lambda', id, fn.FunctionName || 'Lambda', {
      functionName: fn.FunctionName,
      runtime: fn.Runtime,
      handler: fn.Handler,
      memorySize: fn.MemorySize,
      timeout: fn.Timeout,
      lastModified: fn.LastModified,
      codeSize: fn.CodeSize,
    });

    if (fn.VpcConfig?.VpcId && resources.vpcs.find(v => v.VpcId === fn.VpcConfig!.VpcId)) {
      addEdge(fn.VpcConfig.VpcId, id, 'contains');
    }
  }

  // S3 Buckets (standalone, no VPC)
  for (const bucket of resources.s3Buckets) {
    addNode('s3', bucket.name, bucket.name, {
      name: bucket.name,
      tags: bucket.tags,
    });
  }

  return { nodes, edges };
};

function getTagName(tags?: Array<{ Key?: string; Value?: string }>): string | undefined {
  return tags?.find(t => t.Key === 'Name')?.Value;
}