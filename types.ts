
export interface PortResult {
  port: number;
  service: string;
  state: 'open' | 'closed' | 'filtered';
  description?: string;
}

export interface AnalysisResult {
  summary: string;
  vulnerabilities: string[];
  recommendations: string[];
  riskScore: number; // 0-100
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface ScanConfig {
  targetIp: string;
  profile: 'stealth' | 'aggressive' | 'full';
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  config: ScanConfig;
  portCount: number;
  riskScore?: number;
}

export enum AppTab {
  SIMULATOR = 'SIMULATOR',
  ANALYZER = 'ANALYZER',
}
