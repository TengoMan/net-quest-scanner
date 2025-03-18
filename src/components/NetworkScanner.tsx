
import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Device, ScanResults, ScanStatus } from "@/types/scanner";
import { scanNetwork, calculateProgress } from "@/utils/scannerUtils";
import { ScannerButton } from "@/components/ui/ScannerButton";
import { DeviceList } from "@/components/DeviceList";
import { PortScanner } from "@/components/PortScanner";
import { ScanResults as ScanResultsComponent } from "@/components/ScanResults";
import { useToast } from "@/components/ui/use-toast";
import { Wifi, Network, Scan, ArrowRight } from "lucide-react";

export function NetworkScanner() {
  const { toast } = useToast();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [ipRange, setIpRange] = useState("192.168.1.0/24");
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  // Function to handle network scanning
  const handleScan = async () => {
    if (status === "scanning") return;
    
    setStatus("scanning");
    setProgress(0);
    setStartTime(new Date());
    setScanResults(null);
    setSelectedDevice(null);
    
    toast({
      title: "Network scan started",
      description: "Scanning your network for devices...",
      duration: 3000,
    });
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (startTime) {
          setProgress(calculateProgress(startTime));
        }
      }, 100);
      
      // Perform the actual scan
      const results = await scanNetwork();
      setScanResults(results);
      
      clearInterval(progressInterval);
      setProgress(100);
      setStatus("complete");
      
      toast({
        title: "Scan complete",
        description: `Found ${results.totalDevices} devices, ${results.upDevices} online`,
        duration: 3000,
      });
    } catch (error) {
      setStatus("error");
      
      toast({
        title: "Scan failed",
        description: "An error occurred during the network scan",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Reset progress when scan completes
  useEffect(() => {
    if (status === "complete" || status === "error") {
      const timer = setTimeout(() => {
        setProgress(0);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [status]);
  
  // Render scan configuration UI
  const renderScanConfig = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="ip-range">Network Range</Label>
        <div className="flex gap-2">
          <Input
            id="ip-range"
            value={ipRange}
            onChange={(e) => setIpRange(e.target.value)}
            placeholder="192.168.1.0/24"
            disabled={status === "scanning"}
          />
          <ScannerButton
            isScanning={status === "scanning"}
            onClick={handleScan}
            className="whitespace-nowrap"
          >
            <Scan className="h-4 w-4 mr-2" />
            <span>Scan Network</span>
          </ScannerButton>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter an IP range in CIDR notation (e.g., 192.168.1.0/24)
        </p>
      </div>
      
      {status === "scanning" && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex justify-between text-sm">
            <span>Scanning network...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
    </div>
  );
  
  return (
    <div className="container max-w-5xl mx-auto p-4 pt-8 lg:pt-12">
      <div className="mb-8 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
          <Network className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-4xl font-medium tracking-tight mb-3">Network Scanner</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Discover devices on your network and scan for open ports with this minimalist, powerful tool.
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Wifi className="mr-2 h-5 w-5" />
                Network Discovery
              </CardTitle>
              <CardDescription>
                Scan your network to discover connected devices
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {renderScanConfig()}
            </CardContent>
          </Card>
          
          <div className="space-y-1">
            <h2 className="text-lg font-medium flex items-center">
              <ArrowRight className="mr-2 h-4 w-4 text-primary" />
              Discovered Devices
            </h2>
            <p className="text-sm text-muted-foreground">
              {scanResults ? 
                `${scanResults.upDevices} online devices out of ${scanResults.totalDevices} total devices` : 
                "Run a scan to detect devices on your network"
              }
            </p>
          </div>
          
          <DeviceList 
            devices={scanResults?.devices || []} 
            isLoading={status === "scanning"}
          />
        </div>
        
        <div className="space-y-8">
          <Tabs defaultValue="portScan">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="portScan">Port Scanner</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portScan" className="mt-4">
              <PortScanner 
                selectedDevice={selectedDevice} 
                onComplete={(ports) => {
                  if (selectedDevice && scanResults) {
                    // Update the device's ports in the results
                    const updatedDevices = scanResults.devices.map(device => {
                      if (device.id === selectedDevice.id) {
                        return { ...device, ports };
                      }
                      return device;
                    });
                    
                    setScanResults({
                      ...scanResults,
                      devices: updatedDevices
                    });
                    
                    // Update the selected device
                    setSelectedDevice({
                      ...selectedDevice,
                      ports
                    });
                  }
                }}
              />
            </TabsContent>
            
            <TabsContent value="results" className="mt-4">
              <ScanResultsComponent currentScan={scanResults} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>This tool does not send any data outside your network. All scanning is performed locally.</p>
      </div>
    </div>
  );
}
