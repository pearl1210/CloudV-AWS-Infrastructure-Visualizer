import type { ResourceType } from '@/types';

export interface ResourceConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  /** Inline SVG string — render via dangerouslySetInnerHTML inside a sized div */
  icon: string;
}

// ─── Official AWS service icon SVGs (accurate brand colors, inline) ───────────

const EC2_ICON = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="12" fill="#ED7100"/>
  <rect x="16" y="20" width="30" height="40" rx="2" fill="#FFFFFF"/>
  <rect x="50" y="26" width="14" height="6" rx="1" fill="#FFFFFF"/>
  <rect x="50" y="37" width="14" height="6" rx="1" fill="#FFFFFF"/>
  <rect x="50" y="48" width="14" height="6" rx="1" fill="#FFFFFF"/>
  <rect x="20" y="24" width="22" height="14" rx="1" fill="#ED7100"/>
  <rect x="20" y="42" width="6" height="6" rx="1" fill="#ED7100"/>
  <rect x="30" y="42" width="6" height="6" rx="1" fill="#ED7100"/>
  <rect x="20" y="52" width="22" height="3" rx="1" fill="#ED7100"/>
</svg>`;

const VPC_ICON = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="12" fill="#8C4FFF"/>
  <rect x="14" y="14" width="52" height="52" rx="4" fill="none" stroke="#FFFFFF" stroke-width="3"/>
  <rect x="24" y="24" width="14" height="14" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <rect x="42" y="24" width="14" height="14" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <rect x="24" y="42" width="14" height="14" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <rect x="42" y="42" width="14" height="14" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <circle cx="31" cy="31" r="3" fill="#FFFFFF"/>
  <circle cx="49" cy="31" r="3" fill="#FFFFFF"/>
  <circle cx="31" cy="49" r="3" fill="#FFFFFF"/>
  <circle cx="49" cy="49" r="3" fill="#FFFFFF"/>
</svg>`;

const SUBNET_ICON = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="12" fill="#8C4FFF"/>
  <rect x="14" y="14" width="52" height="52" rx="4" fill="none" stroke="#FFFFFF" stroke-width="3"/>
  <rect x="22" y="22" width="16" height="36" rx="2" fill="#FFFFFF"/>
  <rect x="42" y="22" width="16" height="16" rx="2" fill="#FFFFFF"/>
  <rect x="42" y="42" width="16" height="16" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
</svg>`;

const RDS_ICON = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="12" fill="#527FFF"/>
  <ellipse cx="40" cy="26" rx="22" ry="8" fill="#FFFFFF"/>
  <path d="M18 26 Q18 34 40 34 Q62 34 62 26 L62 40 Q62 48 40 48 Q18 48 18 40 Z" fill="#FFFFFF"/>
  <path d="M18 40 Q18 48 40 48 Q62 48 62 40 L62 54 Q62 62 40 62 Q18 62 18 54 Z" fill="#FFFFFF" opacity="0.7"/>
</svg>`;

const S3_ICON = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="12" fill="#569A31"/>
  <path d="M40 10 L64 24 L64 56 L40 70 L16 56 L16 24 Z" fill="#FFFFFF"/>
  <path d="M40 10 L64 24 L40 38 L16 24 Z" fill="#2D6E0D"/>
  <path d="M40 38 L40 70 L16 56 L16 24 Z" fill="#3A8A1A"/>
</svg>`;

const ELB_ICON = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="12" fill="#8C4FFF"/>
  <rect x="28" y="12" width="24" height="16" rx="3" fill="#FFFFFF"/>
  <rect x="12" y="52" width="16" height="16" rx="3" fill="#FFFFFF"/>
  <rect x="32" y="52" width="16" height="16" rx="3" fill="#FFFFFF"/>
  <rect x="52" y="52" width="16" height="16" rx="3" fill="#FFFFFF"/>
  <line x1="40" y1="28" x2="40" y2="42" stroke="#FFFFFF" stroke-width="2.5"/>
  <line x1="40" y1="42" x2="20" y2="52" stroke="#FFFFFF" stroke-width="2.5"/>
  <line x1="40" y1="42" x2="40" y2="52" stroke="#FFFFFF" stroke-width="2.5"/>
  <line x1="40" y1="42" x2="60" y2="52" stroke="#FFFFFF" stroke-width="2.5"/>
  <circle cx="40" cy="42" r="4" fill="#FFFFFF"/>
</svg>`;

const LAMBDA_ICON = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="12" fill="#ED7100"/>
  <path d="M18 66 L30 66 L42 38 L54 66 L66 66 L50 28 L56 16 L44 16 L18 66 Z" fill="#FFFFFF"/>
</svg>`;

const IGW_ICON = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="12" fill="#8C4FFF"/>
  <circle cx="40" cy="40" r="22" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <ellipse cx="40" cy="40" rx="11" ry="22" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <line x1="18" y1="40" x2="62" y2="40" stroke="#FFFFFF" stroke-width="2.5"/>
  <line x1="21" y1="28" x2="59" y2="28" stroke="#FFFFFF" stroke-width="2"/>
  <line x1="21" y1="52" x2="59" y2="52" stroke="#FFFFFF" stroke-width="2"/>
</svg>`;

const SG_ICON = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="12" fill="#DD344C"/>
  <path d="M40 10 L54 20 L54 38 Q54 54 40 62 Q26 54 26 38 L26 20 Z" fill="#FFFFFF"/>
  <path d="M34 40 L38 44 L48 32" stroke="#DD344C" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

// ─── Config map ──────────────────────────────────────────────────────────────

export const RESOURCE_CONFIG: Record<ResourceType, ResourceConfig> = {
  vpc: {
    label: 'VPC',
    color: '#3b0764',
    bgColor: '#f3e8ff',
    borderColor: '#8C4FFF',
    icon: VPC_ICON,
  },
  subnet: {
    label: 'Subnet',
    color: '#3b0764',
    bgColor: '#ede9fe',
    borderColor: '#7c3aed',
    icon: SUBNET_ICON,
  },
  ec2: {
    label: 'EC2',
    color: '#7c2d12',
    bgColor: '#fff7ed',
    borderColor: '#ED7100',
    icon: EC2_ICON,
  },
  rds: {
    label: 'RDS',
    color: '#1e3a8a',
    bgColor: '#eff6ff',
    borderColor: '#527FFF',
    icon: RDS_ICON,
  },
  s3: {
    label: 'S3',
    color: '#14532d',
    bgColor: '#f0fdf4',
    borderColor: '#569A31',
    icon: S3_ICON,
  },
  elb: {
    label: 'Load Balancer',
    color: '#3b0764',
    bgColor: '#f5f3ff',
    borderColor: '#8C4FFF',
    icon: ELB_ICON,
  },
  lambda: {
    label: 'Lambda',
    color: '#7c2d12',
    bgColor: '#fff7ed',
    borderColor: '#ED7100',
    icon: LAMBDA_ICON,
  },
  igw: {
    label: 'Internet Gateway',
    color: '#3b0764',
    bgColor: '#faf5ff',
    borderColor: '#8C4FFF',
    icon: IGW_ICON,
  },
  'security-group': {
    label: 'Security Group',
    color: '#7f1d1d',
    bgColor: '#fef2f2',
    borderColor: '#DD344C',
    icon: SG_ICON,
  },
};

export const formatNodeData = (type: ResourceType, data: Record<string, unknown>): Array<{ key: string; value: string }> => {
  const fields: Array<{ key: string; value: string }> = [];

  const add = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== '') {
      fields.push({ key, value: String(value) });
    }
  };

  switch (type) {
    case 'ec2':
      add('Instance ID', data.instanceId);
      add('Type', data.instanceType);
      add('State', data.state);
      add('Public IP', data.publicIp);
      add('Private IP', data.privateIp);
      add('AZ', data.az);
      add('AMI', data.ami);
      break;
    case 'rds':
      add('DB ID', data.dbInstanceId);
      add('Engine', `${data.engine} ${data.engineVersion}`);
      add('Class', data.instanceClass);
      add('Status', data.status);
      add('Endpoint', data.endpoint);
      add('Port', data.port);
      add('Multi-AZ', data.multiAz);
      add('Storage', `${data.allocatedStorage} GB (${data.storageType})`);
      break;
    case 'vpc':
      add('VPC ID', data.vpcId);
      add('CIDR', data.cidrBlock);
      add('State', data.state);
      add('Default', data.isDefault);
      break;
    case 'subnet':
      add('Subnet ID', data.subnetId);
      add('VPC', data.vpcId);
      add('CIDR', data.cidrBlock);
      add('AZ', data.availabilityZone);
      add('Available IPs', data.availableIpAddressCount);
      add('Auto-assign IP', data.mapPublicIpOnLaunch);
      break;
    case 's3':
      add('Bucket Name', data.name);
      break;
    case 'elb':
      add('Name', data.name);
      add('Type', data.type);
      add('Scheme', data.scheme);
      add('State', data.state);
      add('DNS', data.dnsName);
      break;
    case 'lambda':
      add('Function', data.functionName);
      add('Runtime', data.runtime);
      add('Handler', data.handler);
      add('Memory', `${data.memorySize} MB`);
      add('Timeout', `${data.timeout}s`);
      add('Code Size', data.codeSize ? `${Math.round(Number(data.codeSize) / 1024)} KB` : undefined);
      break;
    case 'igw':
      add('IGW ID', data.internetGatewayId);
      add('State', data.state);
      break;
    case 'security-group':
      add('Group ID', data.groupId);
      add('Name', data.groupName);
      add('Description', data.description);
      add('Inbound Rules', data.inboundRules);
      add('Outbound Rules', data.outboundRules);
      break;
  }

  return fields;
};