export interface LoanAgreement {
  id: string;
  name: string;
  borrower: string;
  facilityAmount: number;
  interestType: string;
  maturityDate: string;
  uploadDate: string;
  parsed: boolean;
}

export interface Covenant {
  id: string;
  name: string;
  type: string;
  threshold: number;
  currentValue: number;
  status: 'healthy' | 'warning' | 'breach';
}

export interface Participant {
  id: string;
  name: string;
  role: 'borrower' | 'lender' | 'agent' | 'buyer';
  exposure: number;
}

export interface Trade {
  id: string;
  seller: Participant;
  buyer: Participant;
  percentage: number;
  price: number;
  timestamp: string;
}

export interface DealSheet {
  id: string;
  title: string;
  trade: Trade;
  agreement: LoanAgreement;
  flowchartImage?: string;
  timestamp: string;
}
