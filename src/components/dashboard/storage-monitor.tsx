import { useMonitoringStore } from '@/stores/monitoring-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatBytes, formatPercentage } from '@/utils/formatters';
import { HardDrive, Database, Activity } from 'lucide-react';

export function StorageMonitor() {
  const { storageInfo } = useMonitoringStore();

  if (!storageInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Storage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Disk Partitions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disk Partitions</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(storageInfo.partitions).map(([device, partition]) => (
              <div key={device} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="font-medium">{partition.mountpoint}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{partition.filesystem}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatPercentage(partition.percent)} used</span>
                    <span>
                      {formatBytes(partition.used)} / {formatBytes(partition.total)}
                    </span>
                  </div>
                  <Progress value={partition.percent} className="w-full h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Device: {device}</span>
                    <span>Free: {formatBytes(partition.free)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disk I/O Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disk I/O Statistics</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {storageInfo.io_counters.read_count.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Read Operations</div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(storageInfo.io_counters.read_bytes)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {storageInfo.io_counters.write_count.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Write Operations</div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(storageInfo.io_counters.write_bytes)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(storageInfo.io_counters.read_time / 1000).toFixed(1)}s
              </div>
              <div className="text-sm text-muted-foreground">Read Time</div>
              <div className="text-xs text-muted-foreground">
                Total time spent reading
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(storageInfo.io_counters.write_time / 1000).toFixed(1)}s
              </div>
              <div className="text-sm text-muted-foreground">Write Time</div>
              <div className="text-xs text-muted-foreground">
                Total time spent writing
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 