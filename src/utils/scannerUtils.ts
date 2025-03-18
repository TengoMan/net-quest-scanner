
import { Device, Port, ScanResults, ScanHistoryItem } from "@/types/scanner";

// Common ports and their services
export const commonPorts: { [key: number]: string } = {
  21: "FTP",
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  53: "DNS",
  80: "HTTP",
  110: "POP3",
  123: "NTP",
  143: "IMAP",
  443: "HTTPS",
  445: "SMB",
  3306: "MySQL",
  3389: "RDP",
  5432: "PostgreSQL",
  8080: "HTTP-Alt",
  8443: "HTTPS-Alt"
};

// Default ports to scan
export const defaultPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 8080, 8443];

// Generate a random MAC address (for demo purposes)
export const generateRandomMac = (): string => {
  return Array.from({ length: 6 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join(':');
};

// Mock data generator for devices (for demo purposes)
export const generateMockDevices = (count: number = 5): Device[] => {
  const baseIp = "192.168.1";
  
  return Array.from({ length: count }).map((_, index) => {
    const ip = `${baseIp}.${10 + index}`;
    const isUp = Math.random() > 0.2; // 80% chance of being up
    
    return {
      id: `device-${index}`,
      ip,
      mac: generateRandomMac(),
      name: getRandomDeviceName(),
      vendor: getRandomVendor(),
      isUp,
      lastSeen: new Date()
    };
  });
};

// Function to simulate port scanning (for demo purposes)
export const scanPorts = async (ip: string, portsToScan: number[] = defaultPorts): Promise<Port[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  return portsToScan.map(port => {
    const randomValue = Math.random();
    let status: 'open' | 'closed' | 'filtered' | 'unknown';
    
    // Simulate different port statuses with weighted probabilities
    if (randomValue < 0.1) {
      status = 'open';
    } else if (randomValue < 0.8) {
      status = 'closed';
    } else if (randomValue < 0.95) {
      status = 'filtered';
    } else {
      status = 'unknown';
    }
    
    // Make certain common ports more likely to be open
    if ((port === 80 || port === 443 || port === 22) && Math.random() < 0.7) {
      status = 'open';
    }
    
    return {
      port,
      service: commonPorts[port] || undefined,
      status
    };
  });
};

// Function to simulate a network scan
export const scanNetwork = async (): Promise<ScanResults> => {
  // Simulate network scan delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
  
  const devices = generateMockDevices(5 + Math.floor(Math.random() * 8));
  const upDevices = devices.filter(device => device.isUp).length;
  
  return {
    devices,
    scanTime: new Date(),
    totalDevices: devices.length,
    upDevices
  };
};

// Function to get port details
export const getPortDetails = (port: number): string => {
  return commonPorts[port] || "Unknown";
};

// Function to generate a random device name (for demo purposes)
const getRandomDeviceName = (): string => {
  const names = [
    "iPhone-13", "Macbook-Pro", "Surface-Laptop", "Galaxy-S22", 
    "iPad-Air", "DESKTOP-PC", "Linux-Server", "Gaming-PC", 
    "Smart-TV", "Echo-Dot", "Nest-Hub", "Fire-TV", "Wi-Fi-Router",
    "NAS-Drive", "Chromecast", "HP-Printer"
  ];
  
  return names[Math.floor(Math.random() * names.length)];
};

// Function to generate a random vendor name (for demo purposes)
const getRandomVendor = (): string => {
  const vendors = [
    "Apple", "Samsung", "Microsoft", "Google", "Amazon", 
    "Sony", "LG", "Intel", "ASUS", "Dell", "Lenovo", "HP",
    "Cisco", "TP-Link", "Netgear", "QNAP", "Synology"
  ];
  
  return vendors[Math.floor(Math.random() * vendors.length)];
};

// Save scan results to local storage
export const saveScanHistory = (result: ScanResults, name?: string): ScanHistoryItem => {
  const history = getScanHistory();
  
  const historyItem: ScanHistoryItem = {
    id: `scan-${Date.now()}`,
    timestamp: new Date(),
    results: result,
    name: name || `Scan ${history.length + 1}`
  };
  
  const updatedHistory = [historyItem, ...history];
  localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
  
  return historyItem;
};

// Get scan history from local storage
export const getScanHistory = (): ScanHistoryItem[] => {
  const history = localStorage.getItem('scanHistory');
  
  if (!history) {
    return [];
  }
  
  try {
    const parsed = JSON.parse(history);
    // Convert string timestamps back to Date objects
    return parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
      results: {
        ...item.results,
        scanTime: new Date(item.results.scanTime)
      }
    }));
  } catch (error) {
    console.error('Error parsing scan history:', error);
    return [];
  }
};

// Delete a scan history item
export const deleteScanHistory = (id: string): void => {
  const history = getScanHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
};

// Clear all scan history
export const clearScanHistory = (): void => {
  localStorage.removeItem('scanHistory');
};

// Format IP address or range for display
export const formatIpRange = (ipRange: string): string => {
  if (ipRange.includes('/')) {
    const [ip, cidr] = ipRange.split('/');
    return `${ip} / ${cidr}`;
  }
  
  return ipRange;
};

// Calculate scan progress percentage (for demo purposes)
export const calculateProgress = (startTime: Date, expectedDuration: number = 3000): number => {
  const elapsed = Date.now() - startTime.getTime();
  const progress = Math.min(Math.floor((elapsed / expectedDuration) * 100), 99);
  return progress;
};
