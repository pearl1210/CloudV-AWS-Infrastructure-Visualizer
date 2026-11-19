interface DashboardGraphToolbarProps {
  appTag: string;
  nodeCount: number;
  edgeCount: number;
  lastFetchedAt: string;
  isCached: boolean;
  isLoadingGraph: boolean;
  onBack: () => void;
  onOpenResources: () => void;
  onOpenConnections: () => void;
  onRefresh: () => void;
}

export default function DashboardGraphToolbar({
  appTag,
  nodeCount,
  edgeCount,
  lastFetchedAt,
  isCached,
  isLoadingGraph,
  onBack,
  onOpenResources,
  onOpenConnections,
  onRefresh,
}: DashboardGraphToolbarProps) {
  return (
    <div className="h-12 bg-white border-b flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
          ← Apps
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-800">{appTag}</span>
        {isCached && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Cached</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <button onClick={onOpenResources} className="hover:text-blue-600 transition-colors">
            {nodeCount} resources
          </button>
          <span>·</span>
          <button onClick={onOpenConnections} className="hover:text-blue-600 transition-colors">
            {edgeCount} connections
          </button>
        </div>
        <span className="text-xs text-gray-300">Last fetched {new Date(lastFetchedAt).toLocaleTimeString()}</span>
        <button
          onClick={onRefresh}
          disabled={isLoadingGraph}
          className="text-xs bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          ↺ Refresh
        </button>
      </div>
    </div>
  );
}