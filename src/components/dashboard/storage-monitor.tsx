import { useMonitoringStore } from '@/stores/monitoring-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatBytes, formatPercentage } from '@/utils/formatters';
import { 
  HardDrive, 
  Database, 
  Activity, 
  BarChart3,
  Info,
  Folder,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useMemo } from 'react';

export function StorageMonitor() {
  const { storageInfo } = useMonitoringStore();

  // Calculate storage statistics
  const storageStats = useMemo(() => {
    if (!storageInfo) return null;

    const partitions = Object.values(storageInfo.partitions);
    const totalSpace = partitions.reduce((sum, p) => sum + p.total, 0);
    const totalUsed = partitions.reduce((sum, p) => sum + p.used, 0);
    const totalFree = partitions.reduce((sum, p) => sum + p.free, 0);
    const avgUsagePercent = partitions.length > 0 ? 
      partitions.reduce((sum, p) => sum + p.percent, 0) / partitions.length : 0;

    const totalOperations = storageInfo.io_counters.read_count + storageInfo.io_counters.write_count;
    const totalBytes = storageInfo.io_counters.read_bytes + storageInfo.io_counters.write_bytes;
    const totalTime = storageInfo.io_counters.read_time + storageInfo.io_counters.write_time;

    // Find most used partition
    const mostUsedPartition = partitions.reduce((max, p) => 
      p.percent > max.percent ? p : max, partitions[0] || { percent: 0 });

    return {
      totalSpace,
      totalUsed,
      totalFree,
      avgUsagePercent,
      totalOperations,
      totalBytes,
      totalTime,
      partitionCount: partitions.length,
      mostUsedPartition,
      readWriteRatio: storageInfo.io_counters.write_count > 0 ? 
        storageInfo.io_counters.read_count / storageInfo.io_counters.write_count : 0
    };
  }, [storageInfo]);

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
    <div className="space-y-6">
      {/* Storage Overview & Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Overview & Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Space */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Space</span>
              </div>
              <div className="text-3xl font-bold">{formatBytes(storageStats?.totalSpace || 0)}</div>
              <div className="text-xs text-muted-foreground">
                {storageStats?.partitionCount || 0} partitions
              </div>
            </div>

            {/* Used Space */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Used Space</span>
              </div>
              <div className="text-3xl font-bold">{formatBytes(storageStats?.totalUsed || 0)}</div>
              <div className="text-xs text-muted-foreground">
                {formatPercentage(storageStats?.avgUsagePercent || 0)} average
              </div>
            </div>

            {/* Usage Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Usage Status</span>
              </div>
              <div className="text-3xl font-bold">{formatPercentage(storageStats?.avgUsagePercent || 0)}</div>
              <Badge
                variant={
                  (storageStats?.avgUsagePercent || 0) < 70 ? "secondary" : 
                  (storageStats?.avgUsagePercent || 0) < 85 ? "default" : "destructive"
                }
              >
                {(storageStats?.avgUsagePercent || 0) < 70 ? "Good" : 
                 (storageStats?.avgUsagePercent || 0) < 85 ? "Fair" : "Critical"}
              </Badge>
            </div>

            {/* I/O Operations */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">I/O Operations</span>
              </div>
              <div className="text-3xl font-bold">{(storageStats?.totalOperations || 0).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(storageStats?.totalBytes || 0)} total
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Space Breakdown</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Capacity</p>
                <p className="font-medium">{formatBytes(storageStats?.totalSpace || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Used Space</p>
                <p className="font-medium">{formatBytes(storageStats?.totalUsed || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Free Space</p>
                <p className="font-medium">{formatBytes(storageStats?.totalFree || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Most Used Partition</p>
                <p className="font-medium">
                  {storageStats?.mostUsedPartition?.mountpoint || 'N/A'} 
                  ({formatPercentage(storageStats?.mostUsedPartition?.percent || 0)})
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disk Partitions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Disk Partitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(storageInfo.partitions).map(([device, partition]) => (
              <div key={device} className="space-y-3 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      partition.percent < 70 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : partition.percent < 85
                        ? 'bg-yellow-100 dark:bg-yellow-900'
                        : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      <Database className={`h-4 w-4 ${
                        partition.percent < 70 
                          ? 'text-green-600' 
                          : partition.percent < 85
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{partition.mountpoint}</h3>
                      <p className="text-xs text-muted-foreground">
                        {partition.filesystem} • {device}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    partition.percent < 70 ? 'secondary' : 
                    partition.percent < 85 ? 'default' : 'destructive'
                  }>
                    {formatPercentage(partition.percent)} used
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatBytes(partition.used)} used</span>
                    <span>{formatBytes(partition.free)} free</span>
                  </div>
                  <Progress value={partition.percent} className="w-full h-2" />
                  <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="block">Total</span>
                      <span className="font-mono">{formatBytes(partition.total)}</span>
                    </div>
                    <div>
                      <span className="block">Used</span>
                      <span className="font-mono">{formatBytes(partition.used)}</span>
                    </div>
                    <div>
                      <span className="block">Available</span>
                      <span className="font-mono">{formatBytes(partition.free)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Read Operations</p>
                </div>
                <p className="text-lg font-semibold">{storageInfo.io_counters.read_count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(storageInfo.io_counters.read_bytes)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-muted-foreground">Write Operations</p>
                </div>
                <p className="text-lg font-semibold">{storageInfo.io_counters.write_count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(storageInfo.io_counters.write_bytes)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-muted-foreground">Read Time</p>
                </div>
                <p className="text-lg font-semibold">
                  {(storageInfo.io_counters.read_time / 1000).toFixed(1)}s
                </p>
                <p className="text-xs text-muted-foreground">
                  Total time spent reading
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <p className="text-sm text-muted-foreground">Write Time</p>
                </div>
                <p className="text-lg font-semibold">
                  {(storageInfo.io_counters.write_time / 1000).toFixed(1)}s
                </p>
                <p className="text-xs text-muted-foreground">
                  Total time spent writing
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="pt-6 border-t">
            <h4 className="text-sm font-medium mb-4">Performance Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Read/Write Ratio</p>
                <p className="text-xl font-bold">
                  {storageStats?.readWriteRatio ? storageStats.readWriteRatio.toFixed(2) : '0.00'}:1
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Total I/O Time</p>
                <p className="text-xl font-bold">
                  {storageStats?.totalTime ? (storageStats.totalTime / 1000).toFixed(1) : '0.0'}s
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Average Operation Size</p>
                <p className="text-xl font-bold">
                  {storageStats?.totalOperations ? 
                    formatBytes((storageStats.totalBytes || 0) / storageStats.totalOperations) : 
                    '0 Bytes'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
