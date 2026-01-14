import { create } from 'zustand';
import { LoanAgreement, Participant, Trade, DealSheet, Covenant } from '../types';
import { Node, Edge } from 'reactflow';

interface AppState {
  currentPage: string;
  isDarkMode: boolean;
  groqApiKey: string;
  currentAgreement: LoanAgreement | null;
  participants: Participant[];
  covenants: Covenant[];
  trades: Trade[];
  dealSheets: DealSheet[];
  isOfflineMode: boolean;
  isAutoSave: boolean;
  flowchartNodes: Node[];
  flowchartEdges: Edge[];

  setCurrentPage: (page: string) => void;
  toggleDarkMode: () => void;
  toggleOfflineMode: () => void;
  toggleAutoSave: () => void;
  setGroqApiKey: (key: string) => void;
  setCurrentAgreement: (agreement: LoanAgreement | null) => void;
  setParticipants: (participants: Participant[]) => void;
  setCovenants: (covenants: Covenant[]) => void;
  addTrade: (trade: Trade) => void;
  addDealSheet: (sheet: DealSheet) => void;
  loadDemoData: () => void;
  updateAgreementData: (data: { metadata: LoanAgreement; covenants: Covenant[]; participants: Participant[]; flowchart?: { nodes: any[]; edges: any[] } }) => void;
}

export const useStore = create<AppState>((set) => ({
  currentPage: 'hero',
  isDarkMode: true,
  isAutoSave: true,
  groqApiKey: '', // User must configure this in Settings
  currentAgreement: null,
  participants: [],
  covenants: [],
  trades: [],
  dealSheets: [],
  isOfflineMode: true,
  flowchartNodes: [],
  flowchartEdges: [],

  setCurrentPage: (page) => set({ currentPage: page }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  toggleOfflineMode: () => set((state) => ({ isOfflineMode: !state.isOfflineMode })),
  toggleAutoSave: () => set((state) => ({ isAutoSave: !state.isAutoSave })),
  setGroqApiKey: (key) => set({ groqApiKey: key }),
  setCurrentAgreement: (agreement) => set({ currentAgreement: agreement }),
  setParticipants: (participants) => set({ participants }),
  setCovenants: (covenants) => set({ covenants }),
  addTrade: (trade) => set((state) => ({ trades: [...state.trades, trade] })),
  addDealSheet: (sheet) => set((state) => ({ dealSheets: [...state.dealSheets, sheet] })),

  loadDemoData: () => set({
    currentAgreement: {
      id: 'demo-001',
      name: 'Term Loan B Agreement',
      borrower: 'Orion Manufacturing Ltd.',
      facilityAmount: 250000000,
      interestType: 'SOFR + 450bps',
      maturityDate: '2029-12-31',
      uploadDate: new Date().toISOString(),
      parsed: true,
    },
    participants: [
      { id: 'p1', name: 'JPMorgan Chase', role: 'lender', exposure: 100000000 },
      { id: 'p2', name: 'Bank of America', role: 'lender', exposure: 75000000 },
      { id: 'p3', name: 'Wells Fargo', role: 'lender', exposure: 75000000 },
      { id: 'p4', name: 'Goldman Sachs', role: 'buyer', exposure: 0 },
      { id: 'p5', name: 'Morgan Stanley', role: 'buyer', exposure: 0 },
    ],
    covenants: [
      { id: 'c1', name: 'DSCR', type: 'Financial', threshold: 1.25, currentValue: 1.45, status: 'healthy' },
      { id: 'c2', name: 'Leverage Ratio', type: 'Financial', threshold: 4.0, currentValue: 3.8, status: 'healthy' },
      { id: 'c3', name: 'Interest Coverage', type: 'Financial', threshold: 3.0, currentValue: 2.9, status: 'warning' },
    ],
    flowchartNodes: [
      { id: '1', type: 'input', data: { label: 'Orion Manufacturing (Borrower)' }, position: { x: 250, y: 0 }, style: { background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '10px' } },
      { id: '2', data: { label: 'Monthly Interest Payment' }, position: { x: 100, y: 100 }, style: { background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px' } },
      { id: '3', data: { label: 'JPMorgan Chase (Lender)' }, position: { x: 100, y: 200 }, style: { background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px' } },
      { id: '4', data: { label: 'Quarterly Reporting' }, position: { x: 400, y: 100 }, style: { background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px' } },
      { id: '5', data: { label: 'Covenant Check (DSCR)' }, position: { x: 400, y: 200 }, style: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px' } },
      { id: '6', data: { label: 'Collateral Trigger' }, position: { x: 400, y: 300 }, style: { background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px' } },
    ],
    flowchartEdges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#22c55e' } },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: '#f59e0b' } },
      { id: 'e4-5', source: '4', target: '5', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#ef4444' } },
    ]
  }),

  updateAgreementData: (data) => set((state) => ({
    currentAgreement: data.metadata,
    covenants: data.covenants,
    participants: data.participants,
    flowchartNodes: data.flowchart?.nodes.map((n, i) => ({
      id: n.id,
      data: { label: n.label },
      position: { x: 250 + (i % 2 === 0 ? -150 : 150) * Math.floor(i / 2), y: i * 100 + 50 }, // Simple auto-layout
      type: i === 0 ? 'input' : 'default',
      style: { background: n.color || '#333', color: 'white', border: 'none', borderRadius: '8px', padding: '10px' }
    })) || state.flowchartNodes,
    flowchartEdges: data.flowchart?.edges.map(e => ({
      ...e,
      animated: true,
      style: { stroke: '#fff' }
    })) || state.flowchartEdges,
    dealSheets: [],
    trades: []
  })),
}));
