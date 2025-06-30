import { useState, useEffect } from 'react';
import { useMonitoringStore } from '@/stores/monitoring-store';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
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
  Cpu, 
  HardDrive, 
  Network, 
  Monitor,
  Zap,
  Home,
  Server,
  Wifi,
  WifiOff,
  Clock,
  BarChart3,
} from 'lucide-react';

const navigationItems = [
  {
    id: 'overview',
    title: 'Overview',
    icon: Home,
    description: 'System overview and key metrics',
    color: 'text-blue-500'
  },
  {
    id: 'cpu',
    title: 'CPU',
    icon: Cpu,
    description: 'Processor monitoring and statistics',
    color: 'text-orange-500'
  },
  {
    id: 'processes',
    title: 'Processes',
    icon: Zap,
    description: 'Running processes and resource usage',
    color: 'text-yellow-500'
  },
  {
    id: 'storage',
    title: 'Storage',
    icon: HardDrive,
    description: 'Disk usage and I/O statistics',
    color: 'text-purple-500'
  },
  {
    id: 'network',
    title: 'Network',
    icon: Network,
    description: 'Network interfaces and connections',
    color: 'text-green-500'
  },
  {
    id: 'gpu',
    title: 'GPU',
    icon: Monitor,
    description: 'Graphics processing units',
    color: 'text-red-500'
  },
];

export function MonitoringDashboard() {
  const { 
    fetchAllData, 
    startRealTimeUpdates, 
    stopRealTimeUpdates, 
    isConnected, 
    lastUpdate, 
    error,
    systemInfo
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
      <div className="flex h-screen w-full bg-background">
        {/* Beautiful Sidebar */}
        <Sidebar className="border-r border-border/40 bg-gradient-to-b from-background to-background/95">
          {/* Header */}
          <SidebarHeader className="border-b border-border/40 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3 px-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Server className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  System Monitor
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  {systemInfo?.hostname || 'Real-time monitoring'}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2">
            {/* Navigation Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-3 py-2">
                Monitoring
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActiveView(item.id)}
                          isActive={isActive}
                          className={`
                            group relative w-full justify-start rounded-lg px-3 py-2.5 transition-all duration-200
                            ${isActive 
                              ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/20 shadow-sm' 
                              : 'hover:bg-accent/50 hover:text-accent-foreground hover:scale-[1.02]'
                            }
                          `}
                        >
                          <Icon className={`h-5 w-5 transition-colors ${isActive ? item.color : 'text-muted-foreground group-hover:text-foreground'}`} />
                          <span className="font-medium">{item.title}</span>
                          {isActive && (
                            <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-lg bg-primary"></div>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* System Status Section */}
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-3 py-2">
                System Status
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="mx-3 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 p-4 border border-border/40">
                  {/* Connection Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <Wifi className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">Connection</span>
                    </div>
                    <Badge 
                      variant={isConnected ? 'default' : 'destructive'} 
                      className={`text-xs font-medium ${isConnected ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200' : ''}`}
                    >
                      {isConnected ? 'Live' : 'Offline'}
                    </Badge>
                  </div>

                  {/* Last Update */}
                  {lastUpdate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Updated {new Date(lastUpdate).toLocaleTimeString()}</span>
                    </div>
                  )}

                  {/* System Info */}
                  {systemInfo && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Platform</span>
                          <span className="font-medium">{systemInfo.platform}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Architecture</span>
                          <span className="font-medium">{systemInfo.architecture}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter className="border-t border-border/40 bg-gradient-to-r from-accent/20 to-accent/10">
            <div className="flex items-center justify-center gap-2 px-4 py-3">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Powered by remote-stats
              </span>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col bg-background">
          {/* Enhanced Header */}
          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/40 bg-gradient-to-r from-background to-background/95 px-6 backdrop-blur-sm">
            <SidebarTrigger className="hover:bg-accent/50 transition-colors" />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              {currentItem && (
                <>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/50`}>
                    <currentItem.icon className={`h-4 w-4 ${currentItem.color}`} />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold">{currentItem.title}</h1>
                    <p className="text-sm text-muted-foreground">{currentItem.description}</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Real-time indicator */}
            <div className="ml-auto flex items-center gap-2">
              {isConnected && (
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-200/50">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-700">Real-time</span>
                </div>
              )}
            </div>
          </header>

          {/* Error Display */}
          {error && (
            <div className="p-6">
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <WifiOff className="h-5 w-5" />
                    Connection Error
                  </CardTitle>
                  <CardDescription>{error}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Main Content Area - No unnecessary wrapper cards */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-accent/5">
            <div className="p-6">
              {renderMainContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 