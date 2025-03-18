
import { useState } from "react";
import { ScanHistoryItem, ScanResults as ScanResultsType } from "@/types/scanner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getScanHistory, clearScanHistory, deleteScanHistory } from "@/utils/scannerUtils";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, Save, Trash2, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ScanResultsProps {
  currentScan: ScanResultsType | null;
  onSaveScan?: (scan: ScanHistoryItem) => void;
}

export function ScanResults({ currentScan, onSaveScan }: ScanResultsProps) {
  const { toast } = useToast();
  const [history, setHistory] = useState<ScanHistoryItem[]>(getScanHistory());
  const [showAll, setShowAll] = useState(false);
  
  // Save current scan to history
  const handleSave = () => {
    if (!currentScan) return;
    
    const savedItem = {
      id: `scan-${Date.now()}`,
      timestamp: new Date(),
      results: currentScan,
      name: `Scan ${history.length + 1}`
    };
    
    const updatedHistory = [savedItem, ...history];
    localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    
    if (onSaveScan) {
      onSaveScan(savedItem);
    }
    
    toast({
      title: "Scan saved",
      description: "The scan results have been saved to history",
      duration: 3000,
    });
  };
  
  // Delete a scan from history
  const handleDelete = (id: string) => {
    deleteScanHistory(id);
    setHistory(getScanHistory());
    
    toast({
      title: "Scan deleted",
      description: "The scan has been removed from history",
      duration: 3000,
    });
  };
  
  // Clear all scan history
  const handleClearAll = () => {
    clearScanHistory();
    setHistory([]);
    
    toast({
      title: "History cleared",
      description: "All scan history has been deleted",
      duration: 3000,
    });
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleString();
  };
  
  // Render current scan
  const renderCurrentScan = () => {
    if (!currentScan) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No recent scan results
        </div>
      );
    }
    
    return (
      <Card className="animate-scale">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Current Scan Results</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {currentScan.scanTime.toLocaleString()}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-semibold">{currentScan.totalDevices}</div>
                <div className="text-xs text-muted-foreground">Total Devices</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-semibold">{currentScan.upDevices}</div>
                <div className="text-xs text-muted-foreground">Online Devices</div>
              </div>
            </div>
            
            <div className="text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Scan Time</span>
                <span>{formatTimestamp(currentScan.scanTime)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Online Percentage</span>
                <span>{Math.round((currentScan.upDevices / currentScan.totalDevices) * 100)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render history list
  const renderHistory = () => {
    if (history.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No scan history available
        </div>
      );
    }
    
    const displayedHistory = showAll ? history : history.slice(0, 3);
    
    return (
      <div className="space-y-3">
        {displayedHistory.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  {item.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="flex items-center text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimestamp(item.timestamp)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="text-sm grid grid-cols-2 gap-3">
                <div>
                  <div className="font-medium">Total Devices</div>
                  <div>{item.results.totalDevices}</div>
                </div>
                <div>
                  <div className="font-medium">Online</div>
                  <div>{item.results.upDevices} ({Math.round((item.results.upDevices / item.results.totalDevices) * 100)}%)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {history.length > 3 && (
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground text-sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All ({history.length - 3} more)
              </>
            )}
          </Button>
        )}
        
        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full mt-2">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Scan History</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All saved scan history will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    );
  };
  
  return (
    <Tabs defaultValue="current" className="animate-fade-in">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="current">Current Scan</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="current" className="mt-4">
        {renderCurrentScan()}
      </TabsContent>
      
      <TabsContent value="history" className="mt-4">
        {renderHistory()}
      </TabsContent>
    </Tabs>
  );
}
