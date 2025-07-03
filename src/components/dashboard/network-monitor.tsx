import { useMonitoringStore } from '@/stores/monitoring-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBytes, formatNetworkAddress } from '@/utils/formatters';
import { 
  Wifi, 
  Network, 
  Globe, 
  ArrowUp, 
  ArrowDown, 
  Activity,
  Signal,
  Router,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  BarChart3
} from 'lucide-react';
import { useMemo } from 'react';

export function NetworkMonitor() {
  const { networkInfo, networkConnections } = useMonitoringStore();

  // Calculate network statistics
  const networkStats = useMemo(() => {
    if (!networkInfo) return null;

    const totalBytes = networkInfo.io_counters.bytes_sent + networkInfo.io_counters.bytes_recv;
    const totalPackets = networkInfo.io_counters.packets_sent + networkInfo.io_counters.packets_recv;
    const totalErrors = networkInfo.io_counters.errin + networkInfo.io_counters.errout;
    const totalDrops = networkInfo.io_counters.dropin + networkInfo.io_counters.dropout;
    
    const activeInterfaces = Object.entries(networkInfo.interfaces).filter(([, info]) => info.stats.isup);
    const totalSpeed = activeInterfaces.reduce((sum, [, info]) => sum + (info.stats.speed || 0), 0);

    return {
      totalBytes,
      totalPackets,
      totalErrors,
      totalDrops,
      activeInterfaces: activeInterfaces.length,
      totalInterfaces: Object.keys(networkInfo.interfaces).length,
      totalSpeed,
      errorRate: totalPackets > 0 ? (totalErrors / totalPackets) * 100 : 0,
      dropRate: totalPackets > 0 ? (totalDrops / totalPackets) * 100 : 0
    };
  }, [networkInfo]);

  // Group connections by status
  const connectionStats = useMemo(() => {
    if (!networkConnections) return null;

    const statusCounts = networkConnections.connections.reduce((acc, conn) => {
      acc[conn.status] = (acc[conn.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: networkConnections.count,
      byStatus: statusCounts,
      listening: statusCounts.LISTEN || 0,
      established: statusCounts.ESTABLISHED || 0,
      timeWait: statusCounts.TIME_WAIT || 0
    };
  }, [networkConnections]);

  if (!networkInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Network Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Overview & Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Overview & Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Traffic */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Traffic</span>
              </div>
              <div className="text-3xl font-bold">{formatBytes(networkStats?.totalBytes || 0)}</div>
              <div className="text-xs text-muted-foreground">
                {(networkStats?.totalPackets || 0).toLocaleString()} packets
              </div>
            </div>

            {/* Active Interfaces */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Signal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Interfaces</span>
              </div>
              <div className="text-3xl font-bold">
                {networkStats?.activeInterfaces}/{networkStats?.totalInterfaces}
              </div>
              <div className="text-xs text-muted-foreground">
                {networkStats?.totalSpeed ? `${networkStats.totalSpeed} Mbps` : 'Speed unknown'}
              </div>
            </div>

            {/* Error Rate */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Error Rate</span>
              </div>
              <div className="text-3xl font-bold">{(networkStats?.errorRate || 0).toFixed(3)}%</div>
              <Badge
                variant={
                  (networkStats?.errorRate || 0) < 0.1 ? "secondary" : 
                  (networkStats?.errorRate || 0) < 1 ? "default" : "destructive"
                }
              >
                {(networkStats?.errorRate || 0) < 0.1 ? "Good" : 
                 (networkStats?.errorRate || 0) < 1 ? "Fair" : "Poor"}
              </Badge>
            </div>

            {/* Connections */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Router className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Connections</span>
              </div>
              <div className="text-3xl font-bold">{connectionStats?.total || 0}</div>
              <div className="text-xs text-muted-foreground">
                {connectionStats?.established || 0} established
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Traffic Breakdown</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Bytes Sent</p>
                <p className="font-medium">{formatBytes(networkInfo.io_counters.bytes_sent)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bytes Received</p>
                <p className="font-medium">{formatBytes(networkInfo.io_counters.bytes_recv)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Packets Sent</p>
                <p className="font-medium">{networkInfo.io_counters.packets_sent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Packets Received</p>
                <p className="font-medium">{networkInfo.io_counters.packets_recv.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Interfaces */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Network Interfaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(networkInfo.interfaces).map(([interfaceName, info]) => {
              const isWireless = interfaceName.startsWith('wlan') || interfaceName.startsWith('wlp');
              const isLoopback = interfaceName.startsWith('lo');
              
              return (
                <div key={interfaceName} className="space-y-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        info.stats.isup 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {isWireless ? (
                          <Wifi className={`h-4 w-4 ${info.stats.isup ? 'text-green-600' : 'text-gray-400'}`} />
                        ) : isLoopback ? (
                          <Activity className={`h-4 w-4 ${info.stats.isup ? 'text-blue-600' : 'text-gray-400'}`} />
                        ) : (
                          <Globe className={`h-4 w-4 ${info.stats.isup ? 'text-green-600' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{interfaceName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {isWireless ? 'Wireless Interface' : isLoopback ? 'Loopback Interface' : 'Ethernet Interface'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={info.stats.isup ? 'default' : 'secondary'}>
                      {info.stats.isup ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {info.stats.isup ? 'UP' : 'DOWN'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {info.addresses.map((addr, idx) => (
                      <div key={idx}>
                        <p className="text-muted-foreground text-xs">
                          {addr.family === '2' ? 'IPv4' : addr.family === '17' ? 'MAC' : 'Address'}
                        </p>
                        <p className="font-mono text-xs">
                          {formatNetworkAddress(addr.address, addr.netmask)}
                        </p>
                      </div>
                    ))}
                    
                    <div>
                      <p className="text-muted-foreground text-xs">MTU</p>
                      <p className="font-mono text-sm">{info.stats.mtu}</p>
                    </div>
                    
                    {info.stats.speed > 0 && (
                      <div>
                        <p className="text-muted-foreground text-xs">Speed</p>
                        <p className="font-mono text-sm">{info.stats.speed} Mbps</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Advanced Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* I/O Statistics */}
          <div>
            <h4 className="text-sm font-medium mb-4">I/O Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowDown className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-muted-foreground">Downloaded</p>
                </div>
                <p className="text-lg font-semibold">{formatBytes(networkInfo.io_counters.bytes_recv)}</p>
                <p className="text-xs text-muted-foreground">
                  {networkInfo.io_counters.packets_recv.toLocaleString()} packets
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowUp className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                </div>
                <p className="text-lg font-semibold">{formatBytes(networkInfo.io_counters.bytes_sent)}</p>
                <p className="text-xs text-muted-foreground">
                  {networkInfo.io_counters.packets_sent.toLocaleString()} packets
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
                <p className="text-lg font-semibold">
                  {networkInfo.io_counters.errin + networkInfo.io_counters.errout}
                </p>
                <p className="text-xs text-muted-foreground">
                  In: {networkInfo.io_counters.errin} / Out: {networkInfo.io_counters.errout}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <p className="text-sm text-muted-foreground">Drops</p>
                </div>
                <p className="text-lg font-semibold">
                  {networkInfo.io_counters.dropin + networkInfo.io_counters.dropout}
                </p>
                <p className="text-xs text-muted-foreground">
                  In: {networkInfo.io_counters.dropin} / Out: {networkInfo.io_counters.dropout}
                </p>
              </div>
            </div>
          </div>

          {/* Connection Statistics */}
          {connectionStats && (
            <div className="pt-6 border-t">
              <h4 className="text-sm font-medium mb-4">Connection Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Listening</p>
                  <p className="text-xl font-bold">{connectionStats.listening}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Established</p>
                  <p className="text-xl font-bold">{connectionStats.established}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Time Wait</p>
                  <p className="text-xl font-bold">{connectionStats.timeWait}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Connections */}
      {networkConnections && networkConnections.connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Router className="h-5 w-5" />
              Active Network Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Local Address</TableHead>
                  <TableHead>Remote Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>PID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networkConnections.connections.slice(0, 15).map((conn, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">{conn.laddr}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {conn.raddr || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          conn.status === 'LISTEN' ? 'secondary' : 
                          conn.status === 'ESTABLISHED' ? 'default' : 
                          conn.status === 'TIME_WAIT' ? 'outline' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {conn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {conn.pid || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {networkConnections.connections.length > 15 && (
              <div className="text-center text-sm text-muted-foreground mt-4 p-2 bg-muted rounded">
                ... and {networkConnections.connections.length - 15} more connections
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
