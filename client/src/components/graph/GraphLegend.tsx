import { RESOURCE_CONFIG } from '@/lib/ConfigResource';
import type { ResourceType } from '@/types';

const CONNECTION_TYPES = [
  { label: 'contains', color: '#2563eb' },
  { label: 'hosts', color: '#0f766e' },
  { label: 'uses', color: '#ea580c' },
  { label: 'routes to', color: '#7c3aed' },
  { label: 'attached to', color: '#16a34a' },
];

const RESOURCE_TYPES: ResourceType[] = ['vpc', 'subnet', 'igw', 'ec2', 'rds', 's3', 'elb', 'lambda', 'security-group'];

type GraphLegendProps = {
  isOpen: boolean;
};

export default function GraphLegend({ isOpen }: GraphLegendProps) {
  if (!isOpen) return null;


  return (
    <div
      className="absolute bottom-3 left-4 bg-white border border-gray-200 rounded-xl shadow-md p-3 z-10" 
      style={{ minWidth: '170px' }}
    >
      <p className="text-xs font-semibold text-gray-500 mb-2.5 uppercase tracking-wide">Resource</p>
      <div className="flex flex-col gap-2">
        {RESOURCE_TYPES.map((t) => {
          const cfg = RESOURCE_CONFIG[t];
          return (
            <div key={t} className="flex items-center gap-2.5">
              {/* Mini AWS icon */}
              <div
                style={{
                  width: '15px',
                  height: '15px',
                  flexShrink: 0,
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
                dangerouslySetInnerHTML={{ __html: cfg.icon }}
              />
              <span style={{ fontSize: '12px', color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 mb-2.5 uppercase tracking-wide">Connection Types</p>
        <div className="flex flex-col gap-2">
          {CONNECTION_TYPES.map((relation) => (
            <div key={relation.label} className="flex items-center gap-2.5">
              <div
                style={{
                  width: '18px',
                  height: '0',
                  borderTop: `2px solid ${relation.color}`,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    right: '-2px',
                    top: '-4px',
                    width: '0',
                    height: '0',
                    borderLeft: `5px solid ${relation.color}`,
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                  }}
                />
              </div>
              <span style={{ fontSize: '12px', color: '#334155', fontWeight: 500, textTransform: 'capitalize' }}>{relation.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}