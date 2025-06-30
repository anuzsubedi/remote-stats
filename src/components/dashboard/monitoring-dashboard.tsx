import { useState, useEffect } from 'react';
import { useMonitoringStore } from '@/stores/monitoring-store';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SystemOverview } from './system-overview';
import { ProcessesMonitor } from './processes';
import { StorageMonitor } from './storage-monitor';
import { NetworkMonitor } from './network-monitor';
import { GpuMonitor } from './gpu-monitor';
import { CpuMonitor } from './cpu-monitor';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Network, 
  Monitor,
  Zap,
  Home
} from 'lucide-react';

const navigationItems = [
  {
    id: 'overview',
    title: 'Overview',
    icon: Home,
    description: 'System overview and key metrics'
  },
  {
    id: 'cpu',
    title: 'CPU',
    icon: Cpu,
    description: 'Processor monitoring and statistics'
  },
  {
    id: 'processes',
    title: 'Processes',
    icon: Zap,
    description: 'Running processes and resource usage'
  },
  {
    id: 'storage',
    title: 'Storage',
    icon: HardDrive,
    description: 'Disk usage and I/O statistics'
  },
  {
    id: 'network',
    title: 'Network',
    icon: Network,
    description: 'Network interfaces and connections'
  },
  {
    id: 'gpu',
    title: 'GPU',
    icon: Monitor,
    description: 'Graphics processing units'
  },
];

export function MonitoringDashboard() {
  const { 
    fetchAllData, 
    startRealTimeUpdates, 
    stopRealTimeUpdates, 
    isConnected, 
    lastUpdate, 
    error 
  } = useMonitoringStore();

  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    // Initial data fetch
    fetchAllData();
    
    // Start real-time updates
    startRealTimeUpdates();
    
    // Cleanup on unmount
    return () => {
      stopRealTimeUpdates();
    };
  }, [fetchAllData, startRealTimeUpdates, stopRealTimeUpdates]);

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return <SystemOverview />;
      case 'cpu':
        return <CpuMonitor />;
      case 'processes':
        return <ProcessesMonitor />;
      case 'storage':
        return <StorageMonitor />;
      case 'network':
        return <NetworkMonitor />;
      case 'gpu':
        return <GpuMonitor />;
      default:
        return <SystemOverview />;
    }
  };

  const currentItem = navigationItems.find(item => item.id === activeView);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <Sidebar variant="inset" className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <div className="px-2 py-4">
                <div className="flex items-center gap-2 px-4">
                  <Activity className="h-6 w-6" />
                  <div className="flex flex-col">
                    <h2 className="text-lg font-semibold">System Monitor</h2>
                    <p className="text-xs text-muted-foreground">Real-time monitoring</p>
                  </div>
                </div>
              </div>
              <Separator />
              <SidebarGroupContent className="mt-4">
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActiveView(item.id)}
                          isActive={isActive}
                          className="w-full justify-start"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
              
              {/* Connection Status */}
              <div className="mt-auto p-4">
                <Separator className="mb-4" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
                      {isConnected ? 'Connected' : 'Offline'}
                    </Badge>
                  </div>
                  {lastUpdate && (
                    <div className="text-xs text-muted-foreground">
                      Last update: {new Date(lastUpdate).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              {currentItem && (
                <>
                  <currentItem.icon className="h-5 w-5" />
                  <div>
                    <h1 className="font-semibold">{currentItem.title}</h1>
                    <p className="text-sm text-muted-foreground">{currentItem.description}</p>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Error Display */}
          {error && (
            <div className="p-4">
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Connection Error</CardTitle>
                  <CardDescription>{error}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-4">
            {renderMainContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 