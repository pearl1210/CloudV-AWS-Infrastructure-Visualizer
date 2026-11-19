import { memo, useEffect, useRef, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ResourceType } from '@/types';
import { RESOURCE_CONFIG, formatNodeData } from '@/lib/ConfigResource';

interface ResourceNodeData {
  label?: string;
  type?: ResourceType;
  resourceData?: Record<string, unknown>;
}

const ResourceNode = memo(({ data }: NodeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showTooltip) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showTooltip]);

  const payload = (data ?? {}) as ResourceNodeData;
  const type = payload.type;
  const label = payload.label?.trim() || 'Unknown resource';
  const resourceData = payload.resourceData ?? {};
  const config = type ? RESOURCE_CONFIG[type] || RESOURCE_CONFIG.ec2 : RESOURCE_CONFIG.ec2;
  const fields = type ? formatNodeData(type, resourceData) : [];
  return (
    <div
      ref={containerRef}
      className="resource-node relative"
    >
      <Handle type="target" position={Position.Top} style={{ background: config.borderColor }} />

      {/* Main node card */}
      <div
        style={{
          background: config.bgColor,
          border: `2px solid ${config.borderColor}`,
          borderRadius: '12px',
          padding: '10px 14px',
          minWidth: '160px',
          maxWidth: '200px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.15s',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip((prev) => !prev);
        }}
      >
        <div
          style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: config.icon }}
        />

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: config.borderColor,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              lineHeight: 1,
              marginBottom: '3px',
            }}
          >
            {config.label}
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: config.color,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}
            title={label}
          >
            {label}
          </div>
        </div>
      </div>

      {/* Click Tooltip */}
      {showTooltip && fields.length > 0 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: 'calc(100% + 12px)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'white',
            border: `1px solid ${config.borderColor}`,
            borderRadius: '12px',
            padding: '14px',
            minWidth: '240px',
            maxWidth: '280px',
            zIndex: 9999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: `1px solid ${config.borderColor}25`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '7px', overflow: 'hidden' }}
                dangerouslySetInnerHTML={{ __html: config.icon }}
              />
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: config.borderColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {config.label}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: config.color }}>{label}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1,
                padding: '2px 4px',
              }}
              aria-label="Close tooltip"
              title="Close"
            >
              x
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {fields.map((f) => (
              <div
                key={f.key}
                style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '12px', alignItems: 'flex-start' }}
              >
                <span style={{ color: '#6b7280', fontWeight: 500, flexShrink: 0, paddingTop: '1px' }}>{f.key}</span>
                <span
                  style={{
                    color: '#111827',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '11px',
                    textAlign: 'right',
                    wordBreak: 'break-all',
                    maxWidth: '170px',
                  }}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: config.borderColor }} />
    </div>
  );
});

ResourceNode.displayName = 'ResourceNode';
export default ResourceNode;