
import { useState } from "react";
import { Device, Port } from "@/types/scanner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScannerButton } from "@/components/ui/ScannerButton";
import { commonPorts, scanPorts } from "@/utils/scannerUtils";
import { useToast } from "@/components/ui/use-toast";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { Scan, AlertTriangle, Clock } from "lucide-react";

interface PortScannerProps {
  selectedDevice: Device | null;
  onComplete?: (ports: Port[]) => void;
}

export function PortScanner({ selectedDevice, onComplete }: PortScannerProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [customPorts, setCustomPorts] = useState("");
  const [scanMode, setScanMode] = useState("common");
  const [results, setResults] = useState<Port[]>([]);
  
  // Parse custom ports input
  const parseCustomPorts = (): number[] => {
    if (!customPorts) return [];
    
    try {
      // Parse comma-separated values, ranges (e.g., 80-100), and individual ports
      return customPorts.split(',').flatMap(part => {
        part = part.trim();
        
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          if (isNaN(start) || isNaN(end)) return [];
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
        
        const port = Number(part);
        return isNaN(port) ? [] : [port];
      });
    } catch (error) {
      console.error("Error parsing ports:", error);
      return [];
    }
  };
  
  // Get ports to scan based on scan mode
  const getPortsToScan = (): number[] => {
    switch (scanMode) {
      case "common":
        return Object.keys(commonPorts).map(Number);
      case "custom":
        return parseCustomPorts();
      case "all":
        return Array.from({ length: 1000 }, (_, i) => i + 1);
      default:
        return Object.keys(commonPorts).map(Number);
    }
  };
  
  // Start port scan
  const handleScan = async () => {
    if (!selectedDevice || isScanning) return;
    
    const portsToScan = getPortsToScan();
    
    if (scanMode === "custom" && portsToScan.length === 0) {
      toast({
        title: "Invalid ports",
        description: "Please enter valid port numbers or ranges (e.g., 80,443,8000-8100)",
        variant: "destructive",
      });
      return;
    }
    
    setIsScanning(true);
    setResults([]);
    
    const scanDuration = scanMode === "all" ? "This may take several minutes" : "This may take a moment";
    
    toast({
      title: "Port scan started",
      description: `Scanning ${portsToScan.length} ports on ${selectedDevice.ip}. ${scanDuration}.`,
      duration: 4000,
    });
    
    try {
      const scanResults = await scanPorts(selectedDevice.ip, portsToScan);
      setResults(scanResults);
      
      if (onComplete) {
        onComplete(scanResults);
      }
      
      const openPorts = scanResults.filter(port => port.status === "open").length;
      
      toast({
        title: "Port scan complete",
        description: `Found ${openPorts} open ports out of ${scanResults.length} scanned`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Scan failed",
        description: "An error occurred while scanning ports",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  const renderScanOptions = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="scan-mode">Scan Type</Label>
        <Select
          value={scanMode}
          onValueChange={setScanMode}
        >
          <SelectTrigger id="scan-mode">
            <SelectValue placeholder="Select scan type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="common">Common Ports ({Object.keys(commonPorts).length})</SelectItem>
            <SelectItem value="custom">Custom Ports</SelectItem>
            <SelectItem value="all">All Ports (1-1000)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {scanMode === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="custom-ports">
            Custom Ports
            <span className="text-xs text-muted-foreground ml-2">(e.g., 80,443,8000-8100)</span>
          </Label>
          <Input
            id="custom-ports"
            value={customPorts}
            onChange={(e) => setCustomPorts(e.target.value)}
            placeholder="80,443,3000-3010"
          />
        </div>
      )}
      
      {scanMode === "all" && (
        <div className="flex items-center mt-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-md text-sm">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Scanning all ports may take a long time and generate significant network traffic.</span>
        </div>
      )}
    </div>
  );
  
  const renderResults = () => {
    if (results.length === 0) return null;
    
    const openPorts = results.filter(port => port.status === "open");
    
    return (
      <div className="space-y-4 mt-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Scan Results</h3>
          <span className="text-xs text-muted-foreground">
            <Clock className="inline h-3 w-3 mr-1" />
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        
        {openPorts.length === 0 ? (
          <div className="text-sm text-center py-3 border rounded-md bg-muted/30">
            No open ports found
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {openPorts.map((port) => (
              <div 
                key={port.port} 
                className="text-sm px-3 py-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30"
              >
                <div className="font-medium">{port.port}</div>
                {port.service && <div className="text-xs text-muted-foreground">{port.service}</div>}
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Scanned {results.length} ports • Found {openPorts.length} open
        </div>
      </div>
    );
  };
  
  if (!selectedDevice) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
          <Scan className="h-12 w-12 text-muted-foreground mb-3 opacity-80" />
          <CardTitle className="text-lg font-medium mb-2">No Device Selected</CardTitle>
          <CardDescription>
            Select a device from the list to scan its ports
          </CardDescription>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="animate-blur">
      <CardHeader>
        <CardTitle className="text-base">Port Scanner</CardTitle>
        <CardDescription>
          Scan for open ports on {selectedDevice.ip}
          {selectedDevice.name && ` (${selectedDevice.name})`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {renderScanOptions()}
        {renderResults()}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <ScannerButton 
          onClick={handleScan} 
          isScanning={isScanning}
        >
          Start Scan
        </ScannerButton>
      </CardFooter>
    </Card>
  );
}
