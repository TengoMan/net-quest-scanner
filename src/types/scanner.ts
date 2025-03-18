
export interface Device {
  id: string;
  ip: string;
  mac?: string;
  name?: string;
  vendor?: string;
  isUp: boolean;
  ports?: Port[];
  lastSeen?: Date;
}

export interface Port {
  port: number;
  service?: string;
  status: 'open' | 'closed' | 'filtered' | 'unknown';
}

export interface ScanResults {
  devices: Device[];
  scanTime: Date;
  totalDevices: number;
  upDevices: number;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: Date;
  results: ScanResults;
  name?: string;
}

export type ScanStatus = 'idle' | 'scanning' | 'complete' | 'error';

export interface NetworkScanOptions {
  ipRange?: string;
  ports?: number[];
  timeout?: number;
}
