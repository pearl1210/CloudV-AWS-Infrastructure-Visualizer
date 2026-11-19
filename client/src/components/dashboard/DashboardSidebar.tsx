import type { MouseEvent } from 'react';
import type { AWSAccount } from '@/types';

interface DashboardSidebarProps {
  isCollapsed: boolean;
  accounts: AWSAccount[];
  selectedAccount: AWSAccount | null;
  apps: string[];
  selectedApp: string | null;
  tagKey: string;
  tagKeyInput: string;
  isLoadingAccounts: boolean;
  isLoadingApps: boolean;
  onConnect: () => void;
  onSelectAccount: (account: AWSAccount) => void;
  onDeleteAccount: (id: string, event: MouseEvent<HTMLButtonElement>) => void;
  onRefreshApps: () => void;
  onSelectApp: (appTag: string) => void;
  onTagKeyInputChange: (value: string) => void;
  onApplyTagKey: () => void;
}

export default function DashboardSidebar({
  isCollapsed,
  accounts,
  selectedAccount,
  apps,
  selectedApp,
  tagKey,
  tagKeyInput,
  isLoadingAccounts,
  isLoadingApps,
  onConnect,
  onSelectAccount,
  onDeleteAccount,
  onRefreshApps,
  onSelectApp,
  onTagKeyInputChange,
  onApplyTagKey,
}: DashboardSidebarProps) {
  return (
    <aside
      className={`bg-white flex flex-col overflow-hidden shrink-0 border-r transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-72 opacity-100'
      }`}
    >
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">AWS Accounts</h2>
          <button
            onClick={onConnect}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg transition-colors"
          >
            + Connect
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={tagKeyInput}
            onChange={(event) => onTagKeyInputChange(event.target.value)}
            placeholder="Tag key (e.g. Application)"
            className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={onApplyTagKey}
            className="text-xs px-2.5 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          Tag key used to group resources into apps
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoadingAccounts && (
          <div className="text-center py-8 text-gray-400 text-sm">Loading accounts…</div>
        )}
        {!isLoadingAccounts && accounts.length === 0 && (
          <div className="text-center py-10 px-4">
            <span className="text-4xl block mb-3">🔗</span>
            <p className="text-sm text-gray-500 font-medium">No accounts connected</p>
            <p className="text-xs text-gray-400 mt-1">Click "Connect" to add your AWS account</p>
          </div>
        )}
        {accounts.map((account) => (
          <div
            key={account._id}
            onClick={() => onSelectAccount(account)}
            className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${
              selectedAccount?._id === account._id
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${account.isActive ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <p className="text-sm font-medium text-gray-800 truncate">{account.accountName}</p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{account.awsAccountId}</p>
                <p className="text-xs text-gray-400">{account.region}</p>
                {account.lastSyncedAt && (
                  <p className="text-[11px] text-gray-300 mt-1">
                    Synced {new Date(account.lastSyncedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={(event) => onDeleteAccount(account._id, event)}
                className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-all shrink-0"
                title="Disconnect"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedAccount && (
        <div className="border-t flex flex-col" style={{ maxHeight: '40%' }}>
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Apps in {selectedAccount.accountName}
            </h3>
            <button
              onClick={onRefreshApps}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              ↺
            </button>
          </div>

          {isLoadingApps && (
            <div className="text-center py-4 text-xs text-gray-400">Scanning resources…</div>
          )}

          {!isLoadingApps && apps.length === 0 && (
            <div className="px-4 py-3 text-xs text-gray-400">
              No apps found with tag <code className="bg-gray-100 px-1 rounded">{tagKey}</code>.<br />
              Tag your resources and try again.
            </div>
          )}

          <div className="overflow-y-auto pb-3 px-3 space-y-1">
            {apps.map((app) => (
              <button
                key={app}
                onClick={() => onSelectApp(app)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                  selectedApp === app
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">📦</span>
                {app}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}