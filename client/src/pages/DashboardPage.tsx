import { useEffect, useState, type MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useAWSStore } from '@/store/useAwsStore';
import type { AWSAccount } from '@/types';
import Navbar from '@/components/layout/Navbar';
import ConnectAWSModal from '@/components/ui/ConnectAWSModal';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardGraphToolbar from '@/components/dashboard/DashboardGraphToolbar';
import GraphDetailsModal from '@/components/dashboard/GraphDetailsModal';
import InfraGraph from '@/components/graph/InfraGraph';
import GraphLegend from '@/components/graph/GraphLegend';

type View = 'accounts' | 'apps' | 'graph';
type GraphListModal = 'resources' | 'connections' | null;

const SIDEBAR_WIDTH = 288;

export default function DashboardPage() {
  const {
    accounts,
    fetchAccounts,
    deleteAccount,
    selectedAccount,
    selectAccount,
    apps,
    isLoadingApps,
    fetchApps,
    currentGraph,
    fetchGraph,
    isLoadingGraph,
    clearGraph,
    isLoadingAccounts,
    error,
  } = useAWSStore();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [view, setView] = useState<View>('accounts');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [tagKey, setTagKey] = useState('Application');
  const [tagKeyInput, setTagKeyInput] = useState('Application');
  const [graphListModal, setGraphListModal] = useState<GraphListModal>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isGraphLegendOpen, setIsGraphLegendOpen] = useState(false);

  useEffect(() => {
    void fetchAccounts();
  }, [fetchAccounts]);

 
  const handleSelectAccount = async (account: AWSAccount) => {
    selectAccount(account);
    setView('apps');
    setSelectedApp(null);
    setIsGraphLegendOpen(false);
    clearGraph();
    await fetchApps(account._id, tagKey);
  };

  const handleSelectApp = async (appTag: string) => {
    if (!selectedAccount) return;

    setSelectedApp(appTag);
    setView('graph');
    setIsGraphLegendOpen(false);
    await fetchGraph(selectedAccount._id, appTag, tagKey);
  };

  const handleRefreshGraph = async () => {
    if (!selectedAccount || !selectedApp) return;

    await fetchGraph(selectedAccount._id, selectedApp, tagKey, true);
  };

  const handleApplyTagKey = async () => {
    setTagKey(tagKeyInput);
    if (selectedAccount) {
      await fetchApps(selectedAccount._id, tagKeyInput);
    }
  };

  const handleDeleteAccount = async (id: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!confirm('Disconnect this AWS account? Cached data will be removed.')) return;

    await deleteAccount(id);

    if (selectedAccount?._id === id) {
      selectAccount(null);
      setView('accounts');
      setSelectedApp(null);
      setIsGraphLegendOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />

      <div className="relative flex flex-1 overflow-hidden">
        <div
          className="absolute top-16 z-30 flex flex-col items-start gap-2"
          style={{ left: isSidebarCollapsed ? 16 : SIDEBAR_WIDTH + 12 }}
        >
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="hidden sm:inline">{isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}</span>
          </button>

          {view === 'graph' && (
            <button
              type="button"
              onClick={() => setIsGraphLegendOpen((current) => !current)}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              aria-label={isGraphLegendOpen ? 'Hide graph legend' : 'Show graph legend'}
              aria-expanded={isGraphLegendOpen}
              title={isGraphLegendOpen ? 'Hide graph legend' : 'Show graph legend'}
            >
              {isGraphLegendOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="hidden sm:inline">{isGraphLegendOpen ? 'Hide legend' : 'Show legend'}</span>
            </button>
          )}
        </div>

        <DashboardSidebar
          isCollapsed={isSidebarCollapsed}
          accounts={accounts}
          selectedAccount={selectedAccount}
          apps={apps}
          selectedApp={selectedApp}
          tagKey={tagKey}
          tagKeyInput={tagKeyInput}
          isLoadingAccounts={isLoadingAccounts}
          isLoadingApps={isLoadingApps}
          onConnect={() => setShowConnectModal(true)}
          onSelectAccount={handleSelectAccount}
          onDeleteAccount={handleDeleteAccount}
          onRefreshApps={() => {
            if (selectedAccount) {
              void fetchApps(selectedAccount._id, tagKey);
            }
          }}
          onSelectApp={handleSelectApp}
          onTagKeyInputChange={setTagKeyInput}
          onApplyTagKey={handleApplyTagKey}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {view === 'graph' && currentGraph && (
            <DashboardGraphToolbar
              appTag={currentGraph.appTag}
              nodeCount={currentGraph.nodes.length}
              edgeCount={currentGraph.edges.length}
              lastFetchedAt={currentGraph.lastFetchedAt}
              isCached={currentGraph.cached}
              isLoadingGraph={isLoadingGraph}
              onBack={() => {
                setView('apps');
                setSelectedApp(null);
                setIsGraphLegendOpen(false);
                clearGraph();
              }}
              onOpenResources={() => setGraphListModal('resources')}
              onOpenConnections={() => setGraphListModal('connections')}
              onRefresh={handleRefreshGraph}
            />
          )}

          {view === 'graph' && (
            <div className="flex-1 relative overflow-hidden">
              {isLoadingGraph && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 gap-3">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-600 font-medium">Fetching AWS resources…</p>
                  <p className="text-xs text-gray-400">Scanning EC2, RDS, S3, VPCs and more</p>
                </div>
              )}

              {currentGraph && !isLoadingGraph && (
                <>
                  <InfraGraph graph={currentGraph} />
                  <GraphLegend isOpen={isGraphLegendOpen} />
                </>
              )}

              {!currentGraph && !isLoadingGraph && (
                <div className="flex h-full items-center justify-center px-8 text-center">
                  <div className="max-w-md rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm">
                    <p className="text-base font-semibold text-gray-900">No graph loaded</p>
                    <p className="mt-2 text-sm text-gray-500">
                      {error || 'Select an application to load its infrastructure graph.'}
                    </p>
                    {selectedApp && (
                      <button
                        type="button"
                        onClick={handleRefreshGraph}
                        className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        Retry graph
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'accounts' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <span className="text-6xl mb-4">🗺️</span>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to CloudV</h2>
              <p className="text-gray-500 max-w-md text-sm leading-relaxed">
                Connect your AWS account to start visualizing your infrastructure.
                Tag your resources with a common key (e.g. <code className="bg-gray-100 px-1 rounded">Application=my-app</code>)
                and CloudV will automatically discover and draw the relationships.
              </p>
              <button
                onClick={() => setShowConnectModal(true)}
                className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Connect AWS Account
              </button>

              <div className="grid grid-cols-3 gap-4 mt-10 max-w-2xl w-full">
                {[
                  { icon: '🔐', title: 'Zero key storage', desc: 'IAM Role AssumeRole — no permanent credentials' },
                  { icon: '🏷️', title: 'Tag-based discovery', desc: 'Group resources into apps using your existing tags' },
                  { icon: '🔍', title: 'Hover for details', desc: 'Hover any resource node to see all its properties' },
                ].map((feature) => (
                  <div key={feature.title} className="bg-white rounded-xl border p-4 text-left">
                    <span className="text-2xl">{feature.icon}</span>
                    <p className="text-sm font-semibold text-gray-800 mt-2">{feature.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'apps' && !selectedApp && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <span className="text-5xl mb-4">📦</span>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Select an Application</h2>
              <p className="text-gray-500 text-sm max-w-sm">
                Choose an application from the sidebar to visualize its complete AWS infrastructure graph.
              </p>
            </div>
          )}
        </main>
      </div>

      {currentGraph && graphListModal && (
        <GraphDetailsModal
          graph={currentGraph}
          mode={graphListModal}
          onClose={() => setGraphListModal(null)}
        />
      )}

      {showConnectModal && <ConnectAWSModal onClose={() => setShowConnectModal(false)} />}
    </div>
  );
}
