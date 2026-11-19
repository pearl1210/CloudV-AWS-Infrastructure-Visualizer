import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeVpcsCommand,
  DescribeSubnetsCommand,
  DescribeSecurityGroupsCommand,
  DescribeInternetGatewaysCommand,
  type Instance,
  type Vpc,
  type Subnet,
  type SecurityGroup,
  type InternetGateway,
} from "@aws-sdk/client-ec2";
import { DescribeDBInstancesCommand, RDSClient } from "@aws-sdk/client-rds";
import type { DBInstance } from "@aws-sdk/client-rds";
import {
  S3Client,
  ListBucketsCommand,
  GetBucketTaggingCommand,
} from "@aws-sdk/client-s3";
import {
  ElasticLoadBalancingV2Client,
  DescribeLoadBalancersCommand,
  DescribeTagsCommand,
  type LoadBalancer,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import {
  LambdaClient,
  ListFunctionsCommand,
  type FunctionConfiguration,
} from "@aws-sdk/client-lambda";

export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

export interface FetchedResources {
  ec2Instances: Instance[];
  vpcs: Vpc[];
  subnets: Subnet[];
  securityGroups: SecurityGroup[];
  internetGateways: InternetGateway[];
  rdsInstances: DBInstance[];
  s3Buckets: Array<{ name: string; tags: Record<string, string> }>;
  loadBalancers: LoadBalancer[];
  lambdaFunctions: FunctionConfiguration[];
}

/** Get temporary credentials via STS AssumeRole */
export const assumeRole = async (
  roleArn: string,
  region: string,
): Promise<AWSCredentials> => {
  const stsClient = new STSClient({ region });

  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: `CloudMapper-${Date.now()}`,
    DurationSeconds: 3600, // 1 hour
  });

  const response = await stsClient.send(command);

  if (!response.Credentials) {
    throw new Error("Failed to assume role: no credentials returned");
  }

  return {
    accessKeyId: response.Credentials.AccessKeyId!,
    secretAccessKey: response.Credentials.SecretAccessKey!,
    sessionToken: response.Credentials.SessionToken!,
  };
};

/** Fetch all resources with a given tag key=value */
export const fetchTaggedResources = async (
  credentials: AWSCredentials,
  region: string,
  tagKey: string,
  tagValue: string,
): Promise<FetchedResources> => {
  const creds = {
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
    region,
  };

  const ec2 = new EC2Client(creds);
  const rds = new RDSClient(creds);
  const s3 = new S3Client({ ...creds, region});
  const elb = new ElasticLoadBalancingV2Client(creds);
  const lambda = new LambdaClient(creds);

  const tagFilter = [{ Name: `tag:${tagKey}`, Values: [tagValue] }];

  // Fetch all resources in parallel
  const [
    ec2Res,
    vpcRes,
    subnetRes,
    sgRes,
    igwRes,
    rdsRes,
    s3Res,
    elbRes,
    lambdaRes,
  ] = await Promise.allSettled([
    ec2.send(new DescribeInstancesCommand({ Filters: tagFilter })),
    ec2.send(new DescribeVpcsCommand({ Filters: tagFilter })),
    ec2.send(new DescribeSubnetsCommand({ Filters: tagFilter })),
    ec2.send(new DescribeSecurityGroupsCommand({ Filters: tagFilter })),
    ec2.send(
      new DescribeInternetGatewaysCommand({
        Filters: [{ Name: `tag:${tagKey}`, Values: [tagValue] }],
      }),
    ),
    rds.send(new DescribeDBInstancesCommand({})),
    s3.send(new ListBucketsCommand({})),
    elb.send(new DescribeLoadBalancersCommand({})),
    lambda.send(new ListFunctionsCommand({})),
  ]);

  // Extract EC2 instances
  const ec2Instances: Instance[] = [];
  if (ec2Res.status === "fulfilled") {
    for (const reservation of ec2Res.value.Reservations || []) {
      ec2Instances.push(...(reservation.Instances || []));
    }
  }

  // Filter RDS by tag (RDS doesn't support tag filters in list command)
  let rdsInstances: DBInstance[] = [];
  if (rdsRes.status === "fulfilled") {
    rdsInstances = (rdsRes.value.DBInstances || []).filter((db) =>
      db.TagList?.some((t) => t.Key === tagKey && t.Value === tagValue),
    );
  }

  // Filter S3 by tag (requires per-bucket tag lookup)
  const s3Buckets: Array<{ name: string; tags: Record<string, string> }> = [];
  if (s3Res.status === "fulfilled") {
    const bucketChecks = await Promise.allSettled(
      (s3Res.value.Buckets || []).map(async (bucket) => {
        try {
          const tagsRes = await s3.send(
            new GetBucketTaggingCommand({ Bucket: bucket.Name! }),
          );

          const tags: Record<string, string> = {};

          for (const t of tagsRes.TagSet || []) {
            tags[t.Key!] = t.Value!;
          }

          if (tags[tagKey] === tagValue) {
            return { name: bucket.Name!, tags };
          }

          return null;
        } catch (err) {
          return null;
        }
      }),
    );

    for (const r of bucketChecks) {
      if (r.status === "fulfilled" && r.value) s3Buckets.push(r.value);
    }
  }

  // Filter ELB by tag
  let loadBalancers: LoadBalancer[] = [];
  if (elbRes.status === "fulfilled") {
    const lbs = elbRes.value.LoadBalancers || [];
    if (lbs.length > 0) {
      const arns = lbs.map((lb) => lb.LoadBalancerArn!);
      try {
        const tagsRes = await elb.send(
          new DescribeTagsCommand({ ResourceArns: arns }),
        );
        const taggedArns = new Set(
          (tagsRes.TagDescriptions || [])
            .filter((td) =>
              td.Tags?.some((t) => t.Key === tagKey && t.Value === tagValue),
            )
            .map((td) => td.ResourceArn!),
        );
        loadBalancers = lbs.filter((lb) => taggedArns.has(lb.LoadBalancerArn!));
      } catch {
        loadBalancers = [];
      }
    }
  }

  // Filter Lambda by tag
  let lambdaFunctions: FunctionConfiguration[] = [];
  // if (lambdaRes.status === 'fulfilled') {
  //   lambdaFunctions = (lambdaRes.value.Functions || []).filter(fn =>
  //     fn.Tags && fn.Tags[tagKey] === tagValue
  //   );
  // }

  return {
    ec2Instances,
    vpcs: vpcRes.status === "fulfilled" ? vpcRes.value.Vpcs || [] : [],
    subnets:
      subnetRes.status === "fulfilled" ? subnetRes.value.Subnets || [] : [],
    securityGroups:
      sgRes.status === "fulfilled" ? sgRes.value.SecurityGroups || [] : [],
    internetGateways:
      igwRes.status === "fulfilled" ? igwRes.value.InternetGateways || [] : [],
    rdsInstances,
    s3Buckets,
    loadBalancers,
    lambdaFunctions,
  };
};

/** Get all unique tag values for a given tag key across all resources */
export const fetchAppTags = async (
  credentials: AWSCredentials,
  region: string,
  tagKey: string,
): Promise<string[]> => {
  const ec2 = new EC2Client({
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
    region,
  });

  const res = await ec2.send(
    new DescribeInstancesCommand({
      Filters: [{ Name: `tag-key`, Values: [tagKey] }],
    }),
  );

  const tags = new Set<string>();
  for (const r of res.Reservations || []) {
    for (const instance of r.Instances || []) {
      const tag = instance.Tags?.find((t) => t.Key === tagKey);
      if (tag?.Value) tags.add(tag.Value);
    }
  }

  // Also check VPCs, RDS, S3, etc.
  const vpcRes = await ec2.send(
    new DescribeVpcsCommand({
      Filters: [{ Name: `tag-key`, Values: [tagKey] }],
    }),
  );
  for (const vpc of vpcRes.Vpcs || []) {
    const tag = vpc.Tags?.find((t) => t.Key === tagKey);
    if (tag?.Value) tags.add(tag.Value);
  }

  return Array.from(tags).sort();
};
