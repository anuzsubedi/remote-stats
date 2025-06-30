import { useMonitoringStore } from '@/stores/monitoring-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBytes, formatNetworkAddress } from '@/utils/formatters';
import { Wifi, Network, Globe, ArrowUpDown } from 'lucide-react';

export function NetworkMonitor() {
  const { networkInfo, networkConnections } = useMonitoringStore();

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
    <div className="grid gap-4">
      {/* Network Interfaces */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network Interfaces</CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(networkInfo.interfaces).map(([interfaceName, info]) => (
              <div key={interfaceName} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {interfaceName.startsWith('wlan') ? (
                      <Wifi className="h-4 w-4" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                    <span className="font-medium">{interfaceName}</span>
                  </div>
                  <Badge variant={info.stats.isup ? 'default' : 'secondary'}>
                    {info.stats.isup ? 'UP' : 'DOWN'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {info.addresses.map((addr, idx) => (
                    <div key={idx}>
                      <span className="text-muted-foreground">
                        {addr.family === '2' ? 'IPv4' : addr.family === '17' ? 'MAC' : 'Address'}:
                      </span>
                      <div className="font-mono text-xs">
                        {formatNetworkAddress(addr.address, addr.netmask)}
                      </div>
                    </div>
                  ))}
                  <div>
                    <span className="text-muted-foreground">MTU:</span> {info.stats.mtu}
                  </div>
                  {info.stats.speed > 0 && (
                    <div>
                      <span className="text-muted-foreground">Speed:</span> {info.stats.speed} Mbps
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network I/O Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network I/O Statistics</CardTitle>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatBytes(networkInfo.io_counters.bytes_recv)}
              </div>
              <div className="text-sm text-muted-foreground">Bytes Received</div>
              <div className="text-xs text-muted-foreground">
                {networkInfo.io_counters.packets_recv.toLocaleString()} packets
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatBytes(networkInfo.io_counters.bytes_sent)}
              </div>
              <div className="text-sm text-muted-foreground">Bytes Sent</div>
              <div className="text-xs text-muted-foreground">
                {networkInfo.io_counters.packets_sent.toLocaleString()} packets
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {networkInfo.io_counters.errin + networkInfo.io_counters.errout}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
              <div className="text-xs text-muted-foreground">
                In: {networkInfo.io_counters.errin} / Out: {networkInfo.io_counters.errout}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {networkInfo.io_counters.dropin + networkInfo.io_counters.dropout}
              </div>
              <div className="text-sm text-muted-foreground">Drops</div>
              <div className="text-xs text-muted-foreground">
                In: {networkInfo.io_counters.dropin} / Out: {networkInfo.io_counters.dropout}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Connections */}
      {networkConnections && networkConnections.connections.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Network Connections ({networkConnections.count})
            </CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
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
                {networkConnections.connections.slice(0, 10).map((conn, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">{conn.laddr}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {conn.raddr || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={conn.status === 'LISTEN' ? 'secondary' : 
                                conn.status === 'ESTABLISHED' ? 'default' : 'outline'}
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
            {networkConnections.connections.length > 10 && (
              <div className="text-center text-sm text-muted-foreground mt-2">
                ... and {networkConnections.connections.length - 10} more connections
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 