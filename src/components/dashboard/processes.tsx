import { useMonitoringStore } from '@/stores/monitoring-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { formatPercentage, formatBytes, getProcessStatusVariant } from '@/utils/formatters';
import { 
  Activity, 
  Zap, 
  Users, 
  Hash, 
  MemoryStick, 
  Cpu, 
  Clock,
  HardDrive,
  BarChart3,
  Info,
  Settings
} from 'lucide-react';

export function ProcessesMonitor() {
  const { topProcesses } = useMonitoringStore();

  if (!topProcesses) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Process Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <div className="animate-pulse">Loading process information...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate summary statistics
  const totalCpuProcesses = topProcesses.top_cpu.length;
  const totalMemoryProcesses = topProcesses.top_memory.length;
  const totalCpuUsage = topProcesses.top_cpu.reduce((sum, proc) => sum + proc.cpu_percent, 0);
  const totalMemoryUsage = topProcesses.top_memory.reduce((sum, proc) => sum + proc.memory_percent, 0);
  const uniqueUsers = new Set([...topProcesses.top_cpu.map(p => p.username), ...topProcesses.top_memory.map(p => p.username)]).size;
  const totalThreads = topProcesses.top_cpu.reduce((sum, proc) => sum + proc.cpu_info.num_threads, 0);

  return (
    <div className="space-y-6">
      {/* Process Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Process Overview & Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Processes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Active Processes</span>
              </div>
              <div className="text-3xl font-bold">{Math.max(totalCpuProcesses, totalMemoryProcesses)}</div>
              <div className="text-xs text-muted-foreground">Currently running</div>
            </div>

            {/* Unique Users */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Active Users</span>
              </div>
              <div className="text-3xl font-bold">{uniqueUsers}</div>
              <div className="text-xs text-muted-foreground">Running processes</div>
            </div>

            {/* Total Threads */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Threads</span>
              </div>
              <div className="text-3xl font-bold">{totalThreads}</div>
              <div className="text-xs text-muted-foreground">CPU threads</div>
            </div>

            {/* Combined Usage */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">System Load</span>
              </div>
              <div className="text-3xl font-bold">{formatPercentage(Math.min(totalCpuUsage, 100))}</div>
              <Badge variant={totalCpuUsage > 80 ? "destructive" : totalCpuUsage > 60 ? "default" : "secondary"}>
                {totalCpuUsage > 80 ? "High" : totalCpuUsage > 60 ? "Medium" : "Low"}
              </Badge>
            </div>
          </div>

          {/* Resource Usage Summary */}
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Resource Usage Summary</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Top CPU Usage</p>
                <p className="font-medium">{formatPercentage(Math.max(...topProcesses.top_cpu.map(p => p.cpu_percent)))}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Top Memory Usage</p>
                <p className="font-medium">{formatPercentage(Math.max(...topProcesses.top_memory.map(p => p.memory_percent)))}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Average CPU</p>
                <p className="font-medium">{formatPercentage(totalCpuUsage / totalCpuProcesses)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Average Memory</p>
                <p className="font-medium">{formatPercentage(totalMemoryUsage / totalMemoryProcesses)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top CPU Processes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Top CPU Processes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Top Process Highlight */}
          {topProcesses.top_cpu.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Cpu className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{topProcesses.top_cpu[0].name}</h4>
                    <p className="text-sm text-muted-foreground">Highest CPU Usage</p>
                  </div>
                </div>
                <Badge variant="default" className="text-sm">
                  {formatPercentage(topProcesses.top_cpu[0].cpu_percent)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">PID</p>
                  <p className="font-medium">{topProcesses.top_cpu[0].pid}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">User</p>
                  <p className="font-medium">{topProcesses.top_cpu[0].username}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Threads</p>
                  <p className="font-medium">{topProcesses.top_cpu[0].cpu_info.num_threads}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={getProcessStatusVariant(topProcesses.top_cpu[0].status)} className="text-xs">
                    {topProcesses.top_cpu[0].status}
                  </Badge>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={topProcesses.top_cpu[0].cpu_percent} className="h-2" />
              </div>
            </div>
          )}

          {/* Process Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Process</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>CPU Usage</TableHead>
                  <TableHead>Threads</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProcesses.top_cpu.slice(0, 10).map((process) => (
                  <TableRow key={`cpu-${process.pid}`} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-muted/50">
                          <Cpu className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{process.name}</div>
                          <div className="text-xs text-muted-foreground">PID: {process.pid}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{process.username}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{formatPercentage(process.cpu_percent)}</div>
                        </div>
                        <Progress value={process.cpu_percent} className="h-1.5 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{process.cpu_info.num_threads}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getProcessStatusVariant(process.status)} className="text-xs">
                        {process.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Memory Processes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            Top Memory Processes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Top Process Highlight */}
          {topProcesses.top_memory.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MemoryStick className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{topProcesses.top_memory[0].name}</h4>
                    <p className="text-sm text-muted-foreground">Highest Memory Usage</p>
                  </div>
                </div>
                <Badge variant="default" className="text-sm">
                  {formatPercentage(topProcesses.top_memory[0].memory_percent)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">PID</p>
                  <p className="font-medium">{topProcesses.top_memory[0].pid}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">User</p>
                  <p className="font-medium">{topProcesses.top_memory[0].username}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Memory</p>
                  <p className="font-medium">{formatBytes(topProcesses.top_memory[0].memory_info.rss)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={getProcessStatusVariant(topProcesses.top_memory[0].status)} className="text-xs">
                    {topProcesses.top_memory[0].status}
                  </Badge>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={topProcesses.top_memory[0].memory_percent} className="h-2" />
              </div>
            </div>
          )}

          {/* Process Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Process</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Memory Usage</TableHead>
                  <TableHead>Memory Size</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProcesses.top_memory.slice(0, 10).map((process) => (
                  <TableRow key={`memory-${process.pid}`} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-muted/50">
                          <MemoryStick className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{process.name}</div>
                          <div className="text-xs text-muted-foreground">PID: {process.pid}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{process.username}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{formatPercentage(process.memory_percent)}</div>
                        </div>
                        <Progress value={process.memory_percent} className="h-1.5 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{formatBytes(process.memory_info.rss)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getProcessStatusVariant(process.status)} className="text-xs">
                        {process.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Process Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Process Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resource Distribution */}
          <div>
            <h4 className="text-sm font-medium mb-4">Resource Distribution</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CPU Distribution */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">CPU Usage Distribution</span>
                </div>
                <div className="space-y-2">
                  {topProcesses.top_cpu.slice(0, 5).map((process, index) => (
                    <div key={`cpu-dist-${process.pid}`} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" style={{ opacity: 1 - (index * 0.15) }} />
                      <div className="flex-1 text-sm">{process.name}</div>
                      <div className="text-sm font-medium">{formatPercentage(process.cpu_percent)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Memory Distribution */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Memory Usage Distribution</span>
                </div>
                <div className="space-y-2">
                  {topProcesses.top_memory.slice(0, 5).map((process, index) => (
                    <div key={`mem-dist-${process.pid}`} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" style={{ opacity: 1 - (index * 0.15) }} />
                      <div className="flex-1 text-sm">{process.name}</div>
                      <div className="text-sm font-medium">{formatPercentage(process.memory_percent)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Summary */}
          <div className="pt-6 border-t">
            <h4 className="text-sm font-medium mb-4">System Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Total CPU Usage</p>
                <p className="text-xl font-bold">{formatPercentage(Math.min(totalCpuUsage, 100))}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Total Memory Usage</p>
                <p className="text-xl font-bold">{formatPercentage(totalMemoryUsage)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Active Threads</p>
                <p className="text-xl font-bold">{totalThreads}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
