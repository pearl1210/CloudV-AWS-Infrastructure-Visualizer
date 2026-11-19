import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAWSStore } from "@/store/useAwsStore";

interface ConnectModalProps {
  onClose: () => void;
}

export default function ConnectAWSModal({ onClose }: ConnectModalProps) {
  const [accountName, setAccountName] = useState("");
  const [awsAccountId, setAwsAccountId] = useState("");
  const [roleArn, setRoleArn] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { connectAccount } = useAWSStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const success = await connectAccount({ accountName, roleArn, awsAccountId, region });
      if (success) {
        onClose();
        return;
      }

      setError("Failed to connect AWS account");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg || "Failed to connect AWS account");
    } finally {
      setLoading(false);
    }
  };

  const AWS_REGIONS = [
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-west-2",
    "eu-central-1",
    "ap-south-1",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-northeast-1",
    "ca-central-1",
    "sa-east-1",
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={loading ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-aws-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div>
            <h2 id="connect-aws-title" className="text-lg font-semibold text-gray-900">
              Connect AWS Account
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Uses IAM Role — no permanent keys stored
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-xl leading-none text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={loading}
          className="flex flex-1 flex-col overflow-hidden"
        >
          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1">
            {/* Setup instructions */}
            <div className="mx-6 mt-5 mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-blue-800 mb-2">
                📋 Setup (one-time, takes 2 min)
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-blue-700 text-xs">
                <li>Open AWS Console → IAM → Roles → Create Role</li>
                <li>
                  Choose <strong>Another AWS account</strong>, enter Account ID:{" "}
                  <code className="bg-blue-100 px-1 rounded font-mono">
                    {import.meta.env.VITE_APP_AWS_ACCOUNT_ID ||
                      "YOUR_APP_ACCOUNT_ID"}
                  </code>
                </li>
                <li>
                  Keep role name as{" "}
                  <code className="bg-blue-100 px-1 rounded font-mono">
                    CloudMapperReadOnlyRole
                  </code>
                </li>
                <li>
                  Create a custom policy and attach it to the role:
                  <pre className="mt-2 bg-blue-100 p-2 rounded overflow-x-auto text-[11px] leading-relaxed">
                    {`{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "ec2:DescribeInstances",
            "ec2:DescribeVpcs",
            "ec2:DescribeSubnets",
            "ec2:DescribeSecurityGroups",
            "ec2:DescribeInternetGateways",
            "rds:DescribeDBInstances",
            "s3:ListAllMyBuckets",
            "s3:GetBucketTagging",
            "elasticloadbalancing:DescribeLoadBalancers",
            "elasticloadbalancing:DescribeTags",
            "lambda:ListFunctions"
          ],
          "Resource": "*"
        }
      ]
    }`}
                  </pre>
                </li>
                <li>
                  Tag all your app resources with the same tag key/value (e.g.{" "}
                  <code className="bg-blue-100 px-1 rounded font-mono">
                    Application=app-1
                  </code>
                  )
                </li>
                <li>Copy the Role ARN and paste it below</li>
              </ol>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Nickname
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="My Production AWS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AWS Account ID
                </label>
                <input
                  type="text"
                  value={awsAccountId}
                  onChange={(e) => setAwsAccountId(e.target.value)}
                  required
                  disabled={loading}
                  pattern="\d{12}"
                  placeholder="123456789012"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  12-digit AWS Account ID (not secret)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IAM Role ARN
                </label>
                <input
                  type="text"
                  value={roleArn}
                  onChange={(e) => setRoleArn(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="arn:aws:iam::123456789012:role/CloudMapperRole"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This ARN is encrypted at rest — no access keys are ever stored
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AWS_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>

          {/* Button section - sticky at bottom */}
          <div className="p-6 border-t flex gap-3 shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Connecting & Verifying…" : "Connect Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
