import { useMonitoringStore } from '@/stores/monitoring-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPercentage, formatBytes, getProcessStatusVariant } from '@/utils/formatters';
import { Activity, Zap } from 'lucide-react';

export function ProcessesMonitor() {
  const { topProcesses } = useMonitoringStore();

  if (!topProcesses) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top CPU Processes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-4">Loading...</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Memory Processes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-4">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Top CPU Processes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top CPU Processes</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Process</TableHead>
                <TableHead>User</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProcesses.top_cpu.slice(0, 8).map((process) => (
                <TableRow key={process.pid}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{process.name}</div>
                      <div className="text-xs text-muted-foreground">PID: {process.pid}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{process.username}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatPercentage(process.cpu_percent)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {process.cpu_info.num_threads} thread{process.cpu_info.num_threads !== 1 ? 's' : ''}
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
        </CardContent>
      </Card>

      {/* Top Memory Processes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Memory Processes</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Process</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProcesses.top_memory.slice(0, 8).map((process) => (
                <TableRow key={process.pid}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{process.name}</div>
                      <div className="text-xs text-muted-foreground">PID: {process.pid}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{process.username}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatPercentage(process.memory_percent)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(process.memory_info.rss)}
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
        </CardContent>
      </Card>
    </div>
  );
} 