
import { useState } from "react";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScannerButton } from "@/components/ui/ScannerButton";
import { Device, Port } from "@/types/scanner";
import { scanPorts } from "@/utils/scannerUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Laptop, Server, Smartphone, Wifi, Globe, AlertCircle, CheckCircle2 } from "lucide-react";

interface DeviceListProps {
  devices: Device[];
  isLoading?: boolean;
}

export function DeviceList({ devices, isLoading = false }: DeviceListProps) {
  const { toast } = useToast();
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [scanningPorts, setScanningPorts] = useState<string | null>(null);
  
  // Function to scan ports for a device
  const handlePortScan = async (device: Device) => {
    if (scanningPorts) return;
    
    setScanningPorts(device.id);
    toast({
      title: "Scanning ports",
      description: `Scanning common ports on ${device.ip}...`,
      duration: 3000,
    });
    
    try {
      const ports = await scanPorts(device.ip);
      
      // Find the device in the list and update its ports
      const updatedDevices = devices.map(d => {
        if (d.id === device.id) {
          return { ...d, ports };
        }
        return d;
      });
      
      // Update the device's ports in the parent component
      devices.forEach((d, index) => {
        if (d.id === device.id) {
          devices[index] = { ...d, ports };
        }
      });
      
      // Show success toast
      toast({
        title: "Port scan complete",
        description: `Scanned ${ports.length} ports on ${device.ip}`,
        duration: 3000,
      });
      
      // Expand the device to show port information
      setExpandedDevice(device.id);
    } catch (error) {
      toast({
        title: "Scan failed",
        description: "Could not complete port scan",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setScanningPorts(null);
    }
  };
  
  // Function to get the appropriate icon for a device
  const getDeviceIcon = (device: Device) => {
    if (device.name?.toLowerCase().includes('server')) {
      return <Server className="h-5 w-5" />;
    } else if (device.name?.toLowerCase().includes('iphone') || device.name?.toLowerCase().includes('galaxy')) {
      return <Smartphone className="h-5 w-5" />;
    } else if (device.name?.toLowerCase().includes('router') || device.name?.toLowerCase().includes('wifi')) {
      return <Wifi className="h-5 w-5" />;
    }
    
    return <Laptop className="h-5 w-5" />;
  };
  
  // Function to render the status indicator for a device
  const renderStatusIndicator = (isUp: boolean) => {
    return isUp ? (
      <div className="flex items-center space-x-1.5">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse-subtle" />
        <span className="text-xs font-medium text-green-600 dark:text-green-400">Online</span>
      </div>
    ) : (
      <div className="flex items-center space-x-1.5">
        <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Offline</span>
      </div>
    );
  };

  // Function to render port information
  const renderPorts = (ports: Port[]) => {
    const openPorts = ports.filter(p => p.status === 'open');
    
    if (openPorts.length === 0) {
      return (
        <div className="mt-2 text-sm text-muted-foreground flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
          No open ports detected
        </div>
      );
    }
    
    return (
      <div className="mt-3 space-y-2">
        <h4 className="text-sm font-medium">Open Ports:</h4>
        <div className="grid grid-cols-2 gap-2">
          {openPorts.map((port) => (
            <div 
              key={port.port} 
              className="text-xs px-2.5 py-1.5 rounded-md bg-secondary"
            >
              <div className="font-medium">{port.port}</div>
              {port.service && <div className="text-muted-foreground">{port.service}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="device-card animate-pulse">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (devices.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
          <Globe className="h-12 w-12 text-muted-foreground mb-3 opacity-80" />
          <CardTitle className="text-lg font-medium mb-2">No Devices Found</CardTitle>
          <CardDescription>
            Run a network scan to detect devices on your network
          </CardDescription>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {devices.map((device) => (
        <Card 
          key={device.id} 
          className={`device-card animate-enter ${device.isUp ? 'border-gray-200 dark:border-gray-800' : 'border-gray-200/50 dark:border-gray-800/50 opacity-75'}`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center">
                {getDeviceIcon(device)}
                <span className="ml-2">{device.name || 'Unknown Device'}</span>
              </CardTitle>
              {renderStatusIndicator(device.isUp)}
            </div>
            <CardDescription className="text-xs">
              {device.vendor && `${device.vendor} • `}MAC: {device.mac || 'Unknown'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-3">
            <div className="flex items-center text-sm">
              <span className="font-medium">IP Address:</span>
              <span className="ml-2 font-mono text-muted-foreground">{device.ip}</span>
            </div>
            
            {expandedDevice === device.id && device.ports && (
              <div className="mt-4 animate-scale">
                {renderPorts(device.ports)}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-0 flex justify-end gap-2">
            {expandedDevice === device.id ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setExpandedDevice(null)}
              >
                Hide Details
              </Button>
            ) : (
              device.ports && device.ports.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setExpandedDevice(device.id)}
                >
                  Show Details
                </Button>
              )
            )}
            
            {(!device.ports || device.ports.length === 0) && device.isUp && (
              <ScannerButton
                size="sm"
                isScanning={scanningPorts === device.id}
                onClick={() => handlePortScan(device)}
              >
                Scan Ports
              </ScannerButton>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
