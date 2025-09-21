'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  NodeMouseHandler,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { initialNodes, initialEdges, EventNodeData } from '@/data/mock-data';
import { useProjectStore } from '@/store/project-store';
import { getLayoutedElements } from '@/lib/dagre-layout';

// GitHub-style service node styles
const getNodeStyles = (nodeType: string) => {
  const baseStyles = {
    background: '#1f2937', // Dark gray background
    border: '1px solid #374151',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#f9fafb',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.3)',
    width: '180px',
    height: '60px',
    textAlign: 'left' as const,
    transition: 'all 0.2s ease-in-out',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center'
  };

  // Add type-specific styling
  const typeColors: Record<string, string> = {
    'file_upload': '#10b981', // Green
    'slack_message': '#8b5cf6', // Purple  
    'github_pr': '#f59e0b', // Orange
    'code_review': '#3b82f6', // Blue
    'deployment': '#ef4444' // Red
  };

  return {
    ...baseStyles,
    borderLeft: `3px solid ${typeColors[nodeType] || '#6b7280'}`
  };
};

// Service icons mapping with GitHub-style icons
const getServiceIcon = (nodeType: string) => {
  const icons: Record<string, string> = {
    'file_upload': '🐙', // GitHub octopus
    'slack_message': '📧', // Email 
    'github_pr': '🐙', // GitHub octopus
    'code_review': '🔵', // Blue circle for API
    'deployment': '🐳' // Docker whale
  };
  return icons[nodeType] || '⚙️';
};

// Custom node component for GitHub-style service nodes
const ServiceNode = ({ data }: { data: EventNodeData }) => {
  const icon = getServiceIcon(data.type);
  
  return (
    <div className="flex items-center gap-2 p-1">
      <div className="flex items-center justify-center w-6 h-6 text-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-xs text-white truncate">
          {data.label}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {data.timestamp}
        </div>
      </div>
    </div>
  );
};

function EventTreeView() {
  const { setSelectedActivity, setActivityDetailOpen } = useProjectStore();

  // Apply automatic layout using Dagre
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    // Apply custom styles to nodes with GitHub-style appearance
    const styledNodes = initialNodes.map((node) => ({
      ...node,
      style: getNodeStyles((node.data as EventNodeData).type),
      type: 'default',
      className: 'hover:shadow-lg hover:scale-105 cursor-pointer transition-all duration-200',
      data: {
        ...node.data,
        label: <ServiceNode data={node.data as EventNodeData} />
      }
    }));

    // Get automatically layouted elements
    return getLayoutedElements(styledNodes, initialEdges, 'TB');
  }, []);

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

  // Handle node click to show activity details
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    const nodeData = node.data as EventNodeData;
    
    // Create activity object compatible with existing activity detail popup
    const activity = {
      id: node.id,
      type: nodeData.type,
      icon: '📄', // Default icon for tree nodes
      title: nodeData.label,
      timestamp: new Date(nodeData.timestamp),
      description: nodeData.description,
      // Add additional fields that might be expected by the activity detail component
      author: {
        name: 'System',
        avatar: '/placeholder-avatar.jpg'
      },
      details: {
        eventType: nodeData.type,
        source: 'Event Tree',
        status: 'completed'
      },
      message: nodeData.description,
      reviews: []
    };

    // Update global state to show activity details
    setSelectedActivity(activity);
    setActivityDetailOpen(true);
  }, [setSelectedActivity, setActivityDetailOpen]);

  return (
    <div className="w-full h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-sm">
      <div className="h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
          className="bg-gray-900"
        >
          <Controls 
            className="bg-gray-800 border border-gray-600 rounded-md shadow-sm [&>button]:bg-gray-800 [&>button]:border-gray-600 [&>button]:text-gray-200 hover:[&>button]:bg-gray-700"
            showInteractive={false}
          />
          <MiniMap 
            className="bg-gray-800 border border-gray-600 rounded-md shadow-sm"
            nodeColor="#6b7280"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Background 
            variant={BackgroundVariant.Dots}
            gap={20} 
            size={1} 
            color="#374151"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default EventTreeView;