import { useEffect } from 'react';
import type { AppGraph } from '@/types';

type GraphDetailsMode = 'resources' | 'connections';

interface GraphDetailsModalProps {
  graph: AppGraph;
  mode: GraphDetailsMode;
  onClose: () => void;
}

export default function GraphDetailsModal({ graph, mode, onClose }: GraphDetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="graph-details-title"
        className="w-full max-w-2xl bg-white rounded-2xl border shadow-xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{graph.appTag}</p>
            <h3 id="graph-details-title" className="text-base font-semibold text-gray-800">
              {mode === 'resources' ? 'Resources' : 'Connections'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
            Close
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {mode === 'resources' && graph.nodes.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-6 text-center text-sm text-gray-500">
              No resources available for this application.
            </div>
          )}

          {mode === 'resources' && graph.nodes.map((node) => (
            <div key={node.id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-sm font-medium text-gray-800">{node.label}</p>
              <p className="text-xs text-gray-500">Type: {node.type}</p>
              <p className="text-xs text-gray-400 font-mono">ID: {node.id}</p>
            </div>
          ))}

          {mode === 'connections' && graph.edges.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-6 text-center text-sm text-gray-500">
              No connections available for this application.
            </div>
          )}

          {mode === 'connections' && graph.edges.map((edge) => {
            const sourceLabel = graph.nodes.find((node) => node.id === edge.source)?.label || edge.source;
            const targetLabel = graph.nodes.find((node) => node.id === edge.target)?.label || edge.target;

            return (
              <div key={edge.id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <p className="text-sm font-medium text-gray-800">{sourceLabel} → {targetLabel}</p>
                <p className="text-xs text-gray-500">Relation: {edge.label || edge.type || 'linked'}</p>
                <p className="text-xs text-gray-400 font-mono">ID: {edge.id}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}