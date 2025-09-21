// Mock data for the Interactive Event Tree Visualizer
// This represents project events and their relationships

import { MarkerType } from 'reactflow';

export const initialNodes = [
  { 
    id: '1', 
    position: { x: 200, y: 50 }, 
    data: { 
      label: 'interview-service',
      type: 'file_upload',
      timestamp: '4 days ago via GitHub',
      description: 'Interview scheduling and management service'
    } 
  },
  { 
    id: '2', 
    position: { x: 450, y: 50 }, 
    data: { 
      label: 'email-service',
      type: 'slack_message',
      timestamp: 'last week via GitHub',
      description: 'Email notification and communication service'
    } 
  },
  { 
    id: '3', 
    position: { x: 50, y: 150 }, 
    data: { 
      label: 'db-voices-migration',
      type: 'github_pr',
      timestamp: 'last week via GitHub',
      description: 'Database migration for voice data'
    } 
  },
  { 
    id: '4', 
    position: { x: 200, y: 150 }, 
    data: { 
      label: 'api-service',
      type: 'code_review',
      timestamp: 'last week via GitHub',
      description: 'Main API service for application'
    } 
  },
  { 
    id: '5', 
    position: { x: 450, y: 150 }, 
    data: { 
      label: 'frontend-nextjs',
      type: 'deployment',
      timestamp: 'last week via GitHub',
      description: 'Next.js frontend application'
    } 
  },
  { 
    id: '6', 
    position: { x: 125, y: 250 }, 
    data: { 
      label: 'Redis',
      type: 'deployment',
      timestamp: 'last month via Docker Image',
      description: 'Redis caching service'
    } 
  },
  { 
    id: '7', 
    position: { x: 325, y: 250 }, 
    data: { 
      label: 'Postgres',
      type: 'deployment',
      timestamp: 'last month via Docker Image',
      description: 'PostgreSQL database service'
    } 
  },
  { 
    id: '8', 
    position: { x: 200, y: 350 }, 
    data: { 
      label: 'auth-service',
      type: 'github_pr',
      timestamp: 'last week via GitHub',
      description: 'Authentication and authorization service'
    } 
  },
  { 
    id: '9', 
    position: { x: 450, y: 350 }, 
    data: { 
      label: 'Nats',
      type: 'file_upload',
      timestamp: 'last month via Docker Image',
      description: 'NATS messaging system'
    } 
  }
];

export const initialEdges = [
  { 
    id: 'e1-4', 
    source: '1', 
    target: '4', 
    type: 'bezier',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: { 
      stroke: '#6b7280',
      strokeWidth: 2
    }
  },
  { 
    id: 'e2-5', 
    source: '2', 
    target: '5', 
    type: 'bezier',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: { 
      stroke: '#6b7280',
      strokeWidth: 2
    }
  },
  { 
    id: 'e3-4', 
    source: '3', 
    target: '4', 
    type: 'bezier',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: { 
      stroke: '#6b7280',
      strokeWidth: 2
    }
  },
  { 
    id: 'e4-6', 
    source: '4', 
    target: '6', 
    type: 'bezier',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: { 
      stroke: '#6b7280',
      strokeWidth: 2
    }
  },
  { 
    id: 'e4-7', 
    source: '4', 
    target: '7', 
    type: 'bezier',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: { 
      stroke: '#6b7280',
      strokeWidth: 2
    }
  },
  { 
    id: 'e4-8', 
    source: '4', 
    target: '8', 
    type: 'bezier',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: { 
      stroke: '#6b7280',
      strokeWidth: 2
    }
  },
  { 
    id: 'e5-9', 
    source: '5', 
    target: '9', 
    type: 'bezier',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: { 
      stroke: '#6b7280',
      strokeWidth: 2
    }
  },
  { 
    id: 'e6-8', 
    source: '6', 
    target: '8', 
    type: 'bezier',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: { 
      stroke: '#6b7280',
      strokeWidth: 2
    }
  },
  { 
    id: 'e7-8', 
    source: '7', 
    target: '8', 
    type: 'bezier',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: { 
      stroke: '#6b7280',
      strokeWidth: 2
    }
  }
];

// Type definitions for better TypeScript support
export interface EventNodeData {
  label: string;
  type: 'file_upload' | 'slack_message' | 'github_pr' | 'code_review' | 'deployment';
  timestamp: string;
  description: string;
}