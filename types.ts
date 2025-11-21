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

export enum AppTab {
  SIMULATOR = 'SIMULATOR',
  ANALYZER = 'ANALYZER',
  ABOUT = 'ABOUT'
}
