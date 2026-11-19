import React, { useMemo } from 'react';
import * as dagre from 'dagre';
import { type NodeProps, type Node as FlowNode, type Edge as FlowEdge, MarkerType, Position } from '@xyflow/react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ResourceType, AppGraph } from '@/types';
import ResourceNode from './ResourceNode';
import { RESOURCE_CONFIG } from '@/lib/ConfigResource';

interface NodeDataType extends Record<string, unknown> {
  label: string;
  type: ResourceType;
  resourceData: Record<string, unknown>;
}

const nodeTypes = { resource: ResourceNode };
const NODE_WIDTH = 200;
const NODE_HEIGHT = 72;

const EDGE_COLORS: Record<string, string> = {
  contains: '#2563eb',
  hosts: '#0f766e',
  uses: '#ea580c',
  'routes to': '#7c3aed',
  'attached to': '#16a34a',
  in: '#475569',
};

const getEdgeColor = (label?: string) => {
  const normalizedLabel = label?.trim().toLowerCase() ?? '';
  return EDGE_COLORS[normalizedLabel] || '#94a3b8';
};

interface InfraGraphProps {
  graph: AppGraph;
}

export default function InfraGraph({ graph }: InfraGraphProps) {
  const getMiniMapNodeColor = (node: FlowNode) => {
    const type = (node.data as NodeDataType | undefined)?.type;
    if (!type || !(type in RESOURCE_CONFIG)) {
      return '#6b7280';
    }
    return RESOURCE_CONFIG[type].borderColor;
  };

  const nodes = useMemo(() => {
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      return [];
    }

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: 'TB',
      nodesep: 60,
      ranksep: 150,
      marginx: 40,
      marginy: 40,
      acyclicer: 'greedy',
      ranker: 'network-simplex',
    });

    const validNodes = graph.nodes.filter((node) => Boolean(node.id && node.label && node.type));
    const validNodeIds = new Set(validNodes.map((node) => node.id));
    const validEdges = graph.edges.filter((edge) => validNodeIds.has(edge.source) && validNodeIds.has(edge.target));

    for (const node of validNodes) {
      dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }

    for (const edge of validEdges) {
      dagreGraph.setEdge(edge.source, edge.target);
    }

    dagre.layout(dagreGraph);

    const connectedIds = new Set<string>();
    for (const edge of validEdges) {
      connectedIds.add(edge.source);
      connectedIds.add(edge.target);
    }

    const connectedNodes: FlowNode[] = [];
    const disconnectedNodes: FlowNode[] = [];

    for (const node of validNodes) {
      const layoutNode = dagreGraph.node(node.id) as { x: number; y: number } | undefined;
      const nodeData: NodeDataType = {
        label: node.label,
        type: node.type,
        resourceData: node.data ?? {},
      };

      const flowNode = {
        id: node.id,
        data: nodeData,
        position: layoutNode
          ? {
            x: layoutNode.x - NODE_WIDTH / 2,
            y: layoutNode.y - NODE_HEIGHT / 2,
          }
          : { x: 0, y: 0 },
        type: 'resource',
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: { width: NODE_WIDTH, minHeight: NODE_HEIGHT },
      } as FlowNode;

      if (connectedIds.has(node.id)) {
        connectedNodes.push(flowNode);
      } else {
        disconnectedNodes.push(flowNode);
      }
    }

    if (connectedNodes.length > 0) {
      const minX = Math.min(...connectedNodes.map((node) => node.position.x));
      const minY = Math.min(...connectedNodes.map((node) => node.position.y));

      for (const node of connectedNodes) {
        node.position = {
          x: node.position.x - minX + 48,
          y: node.position.y - minY + 48,
        };
      }

      const maxY = Math.max(...connectedNodes.map((node) => node.position.y + NODE_HEIGHT));
      const columnCount = Math.min(4, Math.max(1, disconnectedNodes.length));

      disconnectedNodes.forEach((node, index) => {
        const column = index % columnCount;
        const row = Math.floor(index / columnCount);
        node.position = {
          x: 48 + column * (NODE_WIDTH + 70),
          y: maxY + 160 + row * (NODE_HEIGHT + 90),
        };
      });
    }

    return [...connectedNodes, ...disconnectedNodes];
  }, [graph]);

  const edges = useMemo(() => {
    if (!graph || !graph.edges) {
      return [];
    }

    const validNodeIds = new Set(graph.nodes.map((node) => node.id));

    return graph.edges
      .filter((edge) => validNodeIds.has(edge.source) && validNodeIds.has(edge.target))
      .map((edge) => {
        const edgeColor = getEdgeColor(edge.label);

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: edgeColor,
          },
          style: {
            stroke: edgeColor,
            strokeWidth: 1.8,
          },
          labelStyle: {
            fill: '#334155',
            fontSize: 10,
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: 'rgba(255, 255, 255, 0.95)',
          },
          labelBgPadding: [6, 4],
          labelBgBorderRadius: 6,
        } as FlowEdge;
      });
  }, [graph]);

  // Show empty state if no nodes
  if (!nodes || nodes.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>No infrastructure resources found</p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>Make sure your AWS resources are properly tagged</p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlow 
      nodes={nodes as FlowNode[]} 
      edges={edges as FlowEdge[]} 
      nodeTypes={nodeTypes as Record<string, React.ComponentType<NodeProps>>} 
      fitView
      fitViewOptions={{ padding: 0.2, minZoom: 0.15 }}
      minZoom={0.1}
      maxZoom={1.5}
      defaultEdgeOptions={{
        type: 'smoothstep',
      }}
    >
      <Background />
      <Controls />
      <MiniMap
        position="bottom-right"
        pannable
        zoomable
        nodeColor={getMiniMapNodeColor}
        nodeStrokeWidth={2}
        maskColor="rgba(30, 64, 175, 0.14)"
        offsetScale={3}
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
          width: 200,
          height: 140,
          right: 16,
          bottom: 16,
          zIndex: 30,
          pointerEvents: 'all',
        }}
      />
    </ReactFlow>
  );
}