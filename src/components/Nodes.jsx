// Install dependencies first:
// npm install @xyflow/react

import React from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Example nodes and edges
const initialNodes = [
  {
    id: '1',
    position: { x: 50, y: 80 },
    data: { label: 'Start Node' },
    type: 'input',
  },
  {
    id: '2',
    position: { x: 250, y: 200 },
    data: { label: 'Middle Node' },
  },
  {
    id: '3',
    position: { x: 450, y: 80 },
    data: { label: 'End Node' },
    type: 'output',
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
  },
];

export default function FlowComponent() {
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
