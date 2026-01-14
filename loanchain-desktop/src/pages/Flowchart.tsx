import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Orion Manufacturing Ltd. (Borrower)' }, position: { x: 250, y: 0 }, style: { background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '10px' } },
  { id: '2', data: { label: 'Monthly Interest Payment' }, position: { x: 100, y: 100 }, style: { background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px' } },
  { id: '3', data: { label: 'JPMorgan Chase (Lender)' }, position: { x: 100, y: 200 }, style: { background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px' } },
  { id: '4', data: { label: 'Quarterly Reporting' }, position: { x: 400, y: 100 }, style: { background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px' } },
  { id: '5', data: { label: 'Covenant Check (DSCR)' }, position: { x: 400, y: 200 }, style: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px' } },
  { id: '6', data: { label: 'Collateral Trigger' }, position: { x: 400, y: 300 }, style: { background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#22c55e' } },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: '#f59e0b' } },
  { id: 'e4-5', source: '4', target: '5', animated: true },
  { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#ef4444' } },
];

export default function Flowchart() {
  const { setCurrentPage, flowchartNodes, flowchartEdges } = useStore();

  return (
    <div className="h-screen flex flex-col p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Visual Flowchart</h1>
        <p className="text-gray-400 mb-4">Interactive diagram of cash flows, covenants, and triggers</p>
        <button
          onClick={() => setCurrentPage('trade')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
        >
          Continue to Trade Simulator →
        </button>
      </motion.div>

      <div className="glass-card flex-1 overflow-hidden">
        <ReactFlow
          nodes={flowchartNodes}
          edges={flowchartEdges}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
